import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TollgateMap } from "@/components/TollgateMap";
import { ArrowLeft } from "lucide-react";

export default function MapPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user) {
    setLocation("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border z-20">
        <div className="px-8 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setLocation("/dashboard")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tollgate Map</h1>
              <p className="text-muted-foreground mt-1">View all active tollgate locations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Map Content */}
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="card-elegant">
              <p className="text-sm font-medium text-muted-foreground mb-2">Map Features</p>
              <p className="text-foreground">Click on markers to view tollgate details and fees</p>
            </Card>
            <Card className="card-elegant">
              <p className="text-sm font-medium text-muted-foreground mb-2">Real-time Data</p>
              <p className="text-foreground">All active tollgates updated in real-time</p>
            </Card>
            <Card className="card-elegant">
              <p className="text-sm font-medium text-muted-foreground mb-2">Navigation</p>
              <p className="text-foreground">Use map controls to zoom and explore</p>
            </Card>
          </div>

          {/* Map Component */}
          <TollgateMap height="h-[600px]" showDetails={true} />
        </div>
      </div>
    </div>
  );
}
