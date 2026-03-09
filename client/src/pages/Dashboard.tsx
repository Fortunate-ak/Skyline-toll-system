import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VehicleModal } from "@/components/VehicleModal";
import { WalletModal } from "@/components/WalletModal";
import { NotificationCenter } from "@/components/NotificationCenter";
import {
  BarChart3,
  Car,
  Wallet,
  History,
  LogOut,
  Menu,
  X,
  Plus,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Map,
} from "lucide-react";

type DashboardTab = "overview" | "vehicles" | "wallet" | "transactions";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | undefined>();

  // Fetch data
  const walletQuery = trpc.wallet.getBalance.useQuery();
  const vehiclesQuery = trpc.vehicles.list.useQuery();
  const transactionsQuery = trpc.transactions.recent.useQuery();
  const notificationsQuery = trpc.notifications.list.useQuery({ limit: 5 });

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/auth");
  };

  const walletBalance = walletQuery.data?.balance || "0";
  const vehicles = vehiclesQuery.data || [];
  const recentTransactions = transactionsQuery.data || [];
  const notifications = notificationsQuery.data || [];

  const navigationItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "vehicles", label: "Vehicles", icon: Car },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "transactions", label: "Transactions", icon: History },
    { id: "map", label: "Tollgate Map", icon: Map },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-lg font-bold text-foreground">ZimPass</h1>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isMapTab = item.id === "map";
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isMapTab) {
                    setLocation("/map");
                  } else {
                    setActiveTab(item.id as DashboardTab);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-accent text-accent-foreground shadow-lg"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-6 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-all duration-200"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Top Bar */}
        <div className="sticky top-0 bg-card border-b border-border z-30">
          <div className="px-8 py-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                {navigationItems.find(item => item.id === activeTab)?.label}
              </h2>
              <p className="text-muted-foreground mt-1">Welcome back, {user.name || "User"}</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notification Center */}
              <NotificationCenter />
              {/* User Profile */}
              <div className="flex items-center space-x-3 pl-4 border-l border-border">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Wallet Balance Card */}
                <Card className="card-elegant">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Wallet Balance</h3>
                    <Wallet className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-4xl font-bold text-foreground mb-4">${walletBalance}</p>
                  <Button
                    onClick={() => setWalletModalOpen(true)}
                    className="w-full btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Top Up
                  </Button>
                </Card>

                {/* Vehicles Card */}
                <Card className="card-elegant">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Registered Vehicles</h3>
                    <Car className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-4xl font-bold text-foreground mb-4">{vehicles.length}</p>
                  <Button
                    onClick={() => {
                      setSelectedVehicleId(undefined);
                      setVehicleModalOpen(true);
                    }}
                    className="w-full btn-secondary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Vehicle
                  </Button>
                </Card>

                {/* Transactions Card */}
                <Card className="card-elegant">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Recent Transactions</h3>
                    <History className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-4xl font-bold text-foreground mb-4">{recentTransactions.length}</p>
                  <Button className="w-full btn-ghost">View All</Button>
                </Card>
              </div>

              {/* Recent Transactions */}
              <Card className="card-elegant">
                <h3 className="text-lg font-bold text-foreground mb-6">Recent Transactions</h3>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {recentTransactions.slice(0, 5).map(transaction => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                            {transaction.type === "topup" ? (
                              <CreditCard className="w-5 h-5 text-accent" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {transaction.type === "topup" ? "Wallet Top-up" : "Toll Payment"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {transaction.tollgateName || transaction.description}
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-foreground">
                          {transaction.type === "topup" ? "+" : "-"}${transaction.amount}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No transactions yet</p>
                )}
              </Card>

              {/* Notifications */}
              {notifications.length > 0 && (
                <Card className="card-elegant border-l-4 border-l-accent">
                  <h3 className="text-lg font-bold text-foreground mb-4">Recent Notifications</h3>
                  <div className="space-y-3">
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className="flex items-start space-x-3 p-3 bg-muted rounded-lg"
                      >
                        <AlertCircle className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-foreground">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">{notification.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === "vehicles" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground">My Vehicles</h3>
                <Button
                  onClick={() => {
                    setSelectedVehicleId(undefined);
                    setVehicleModalOpen(true);
                  }}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicle
                </Button>
              </div>

              {vehicles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {vehicles.map(vehicle => (
                    <Card key={vehicle.id} className="card-elegant">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">License Plate</p>
                          <p className="text-2xl font-bold text-foreground">{vehicle.plateName}</p>
                        </div>
                        <Car className="w-8 h-8 text-accent" />
                      </div>
                      <div className="space-y-3 mb-6">
                        <div>
                          <p className="text-xs text-muted-foreground">Type</p>
                          <p className="font-medium text-foreground">{vehicle.vehicleType}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Brand</p>
                            <p className="font-medium text-foreground">{vehicle.brand}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Model</p>
                            <p className="font-medium text-foreground">{vehicle.model}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Color</p>
                          <p className="font-medium text-foreground">{vehicle.color}</p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <Button
                          onClick={() => {
                            setSelectedVehicleId(vehicle.id);
                            setVehicleModalOpen(true);
                          }}
                          className="flex-1 btn-secondary"
                        >
                          Edit
                        </Button>
                        <Button className="flex-1 btn-ghost">Remove</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="card-elegant text-center py-12">
                  <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">No vehicles registered yet</p>
                  <Button
                    onClick={() => {
                      setSelectedVehicleId(undefined);
                      setVehicleModalOpen(true);
                    }}
                    className="btn-primary"
                  >
                    Add Your First Vehicle
                  </Button>
                </Card>
              )}
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="space-y-6">
              <Card className="card-elegant bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <p className="text-sm font-medium opacity-90">Current Balance</p>
                <p className="text-5xl font-bold my-4">${walletBalance}</p>
                <p className="text-sm opacity-75">Available for toll payments</p>
              </Card>

              <Card className="card-elegant">
                <h3 className="text-lg font-bold text-foreground mb-6">Top Up Wallet</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="input-elegant"
                    />
                  </div>
                  <Button
                    onClick={() => setWalletModalOpen(true)}
                    className="w-full btn-primary"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Top Up Now
                  </Button>
                </div>
              </Card>

              <Card className="card-elegant">
                <h3 className="text-lg font-bold text-foreground mb-4">Transaction History</h3>
                {recentTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {recentTransactions.map(transaction => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-foreground">
                            {transaction.type === "topup" ? "Wallet Top-up" : "Toll Payment"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-bold text-foreground">
                          {transaction.type === "topup" ? "+" : "-"}${transaction.amount}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No transactions yet</p>
                )}
              </Card>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="space-y-6">
              <Card className="card-elegant">
                <h3 className="text-lg font-bold text-foreground mb-6">All Transactions</h3>
                {recentTransactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                          <th className="text-left py-3 px-4 font-semibold text-foreground">Details</th>
                          <th className="text-right py-3 px-4 font-semibold text-foreground">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTransactions.map(transaction => (
                          <tr key={transaction.id} className="border-b border-border hover:bg-muted">
                            <td className="py-4 px-4 text-foreground">
                              {new Date(transaction.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                transaction.type === "topup"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}>
                                {transaction.type === "topup" ? "Top-up" : "Toll"}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-foreground">
                              {transaction.tollgateName || transaction.description}
                            </td>
                            <td className="py-4 px-4 text-right font-bold text-foreground">
                              {transaction.type === "topup" ? "+" : "-"}${transaction.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-12">No transactions yet</p>
                )}
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <VehicleModal
        isOpen={vehicleModalOpen}
        onClose={() => {
          setVehicleModalOpen(false);
          setSelectedVehicleId(undefined);
        }}
        vehicleId={selectedVehicleId}
      />
      <WalletModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </div>
  );
}
