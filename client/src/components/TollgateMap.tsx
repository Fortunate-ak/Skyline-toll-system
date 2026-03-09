import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { MapView } from "@/components/Map";
import { Card } from "@/components/ui/card";
import { MapPin, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TollgateMapProps {
  height?: string;
  showDetails?: boolean;
}

interface Tollgate {
  id: number;
  name: string;
  description: string | null;
  latitude: string;
  longitude: string;
  address: string | null;
  tollFee: string;
  tollFeeType: string;
  vehicleTypes: string | null;
  isActive: boolean;
  operatingHours: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function TollgateMap({ height = "h-96", showDetails = true }: TollgateMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [selectedTollgate, setSelectedTollgate] = useState<Tollgate | null>(null);

  // Fetch tollgates
  const { data: tollgates = [], isLoading, error } = trpc.tollgates.list.useQuery();

  // Initialize map and add markers
  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;

    // Add markers for each tollgate
    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];

    if (tollgates.length === 0) return;

    tollgates.forEach((tollgate: Tollgate) => {
      const lat = parseFloat(tollgate.latitude);
      const lng = parseFloat(tollgate.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        console.warn(`Invalid coordinates for tollgate ${tollgate.name}`);
        return;
      }

      try {
        // Create marker using AdvancedMarkerElement
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          map,
          position: { lat, lng },
          title: tollgate.name,
        });

        // Add click listener
        marker.addListener("click", () => {
          setSelectedTollgate(tollgate);

          // Pan to marker
          map.panTo(marker.position as google.maps.LatLng);
        });

        markersRef.current.push(marker);
      } catch (e) {
        console.error("Error creating marker:", e);
      }
    });

    // Fit bounds if there are markers
    if (markersRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      markersRef.current.forEach(marker => {
        const pos = marker.position as google.maps.LatLng | google.maps.LatLngLiteral;
        bounds.extend(pos);
      });
      map.fitBounds(bounds);
    }
  };

  if (error) {
    return (
      <Card className="card-elegant flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-foreground font-medium">Failed to load tollgates</p>
          <p className="text-muted-foreground text-sm">{error.message}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="card-elegant p-0 overflow-hidden">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          )}
          <MapView
            initialCenter={{ lat: -19.0154, lng: 29.1549 }}
            initialZoom={7}
            onMapReady={handleMapReady}
            className={height}
          />
        </div>
      </Card>

      {showDetails && selectedTollgate && (
        <Card className="card-elegant">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-1">{selectedTollgate.name}</h3>
              {selectedTollgate.description && (
                <p className="text-sm text-muted-foreground mb-3">{selectedTollgate.description}</p>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedTollgate.address && (
                  <div>
                    <p className="text-muted-foreground">Address</p>
                    <p className="font-medium text-foreground">{selectedTollgate.address}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Toll Fee</p>
                  <p className="font-bold text-accent">${selectedTollgate.tollFee}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fee Type</p>
                  <p className="font-medium text-foreground capitalize">{selectedTollgate.tollFeeType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Coordinates</p>
                  <p className="font-medium text-foreground text-xs">
                    {parseFloat(selectedTollgate.latitude).toFixed(4)}, {parseFloat(selectedTollgate.longitude).toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tollgate List */}
      <Card className="card-elegant">
        <h3 className="text-lg font-bold text-foreground mb-4">Tollgates ({tollgates.length})</h3>
        {tollgates.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {tollgates.map((tollgate: Tollgate) => (
              <button
                key={tollgate.id}
                onClick={() => setSelectedTollgate(tollgate)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  selectedTollgate?.id === tollgate.id
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted hover:bg-muted/80"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{tollgate.name}</p>
                    {tollgate.address && (
                      <p className="text-xs opacity-75 mt-1">{tollgate.address}</p>
                    )}
                  </div>
                  <p className="font-bold">${tollgate.tollFee}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">No tollgates available</p>
        )}
      </Card>
    </div>
  );
}
