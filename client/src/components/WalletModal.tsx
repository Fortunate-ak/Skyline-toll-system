import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const [amount, setAmount] = useState("");
  const topupMutation = trpc.wallet.topup.useMutation();
  const utils = trpc.useUtils();

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await topupMutation.mutateAsync({ amount });
      toast.success("Wallet topped up successfully!");
      await utils.wallet.getBalance.invalidate();
      setAmount("");
      onClose();
    } catch (error) {
      toast.error("Failed to top up wallet");
      console.error(error);
    }
  };

  const quickAmounts = [10, 20, 50, 100];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-accent" />
            <span>Top Up Wallet</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-foreground font-medium">$</span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8 input-elegant"
              />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-3">Quick Amount</p>
            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map(quickAmount => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount.toString())}
                  className={`py-2 px-3 rounded-lg font-medium transition-all duration-200 ${
                    amount === quickAmount.toString()
                      ? "bg-accent text-accent-foreground shadow-lg"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  ${quickAmount}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Amount to be credited</p>
            <p className="text-2xl font-bold text-foreground">${amount || "0.00"}</p>
          </div>

          <div className="flex space-x-3">
            <Button onClick={onClose} className="flex-1 btn-ghost">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={topupMutation.isPending || !amount}
              className="flex-1 btn-primary"
            >
              {topupMutation.isPending ? "Processing..." : "Top Up Now"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
