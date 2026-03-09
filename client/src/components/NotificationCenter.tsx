import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Bell, AlertTriangle, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [playSound, setPlaySound] = useState(true);

  // Fetch notifications
  const { data: notifications = [], refetch } = trpc.notifications.list.useQuery({ limit: 20 });
  const { data: unreadCount = { unreadCount: 0 } } = trpc.notifications.unreadCount.useQuery();

  // Mark as read mutation
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();

  // Check for low balance periodically
  const { data: lowBalanceCheck } = trpc.wallet.checkLowBalance.useQuery(undefined, {
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Show toast when low balance is detected
  useEffect(() => {
    if (lowBalanceCheck?.hasLowBalance && lowBalanceCheck?.notification) {
      const notification = lowBalanceCheck.notification as any;
      toast.error(notification.message || "Low wallet balance", {
        description: notification.title || "Alert",
        duration: 5000,
      });

      // Play sound if enabled
      if (playSound) {
        playNotificationSound();
      }

      // Refetch notifications
      refetch();
    }
  }, [lowBalanceCheck, playSound, refetch]);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log("Could not play notification sound");
    }
  };

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate({ id: notificationId });
    refetch();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "low_balance":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "toll_payment":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-muted rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-foreground" />
        {unreadCount.unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount.unreadCount > 9 ? "9+" : unreadCount.unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-card border border-border rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-foreground">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-muted rounded transition-colors"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.isRead ? "bg-accent/5" : ""
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{notification.title}</p>
                      <p className="text-muted-foreground text-xs mt-1 line-clamp-2">
                        {(notification as any).message}
                      </p>
                      <p className="text-muted-foreground text-xs mt-2">
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="flex-shrink-0 w-2 h-2 bg-accent rounded-full mt-2" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground text-sm">No notifications yet</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-border flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={playSound}
                onChange={(e) => setPlaySound(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-xs text-muted-foreground">Sound alerts</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
