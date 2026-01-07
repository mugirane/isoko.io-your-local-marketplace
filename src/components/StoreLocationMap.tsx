import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";

interface StoreLocationMapProps {
  address: string;
  storeName: string;
  latitude?: number | null;
  longitude?: number | null;
}

const StoreLocationMap = ({ address, storeName, latitude, longitude }: StoreLocationMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );

  useEffect(() => {
    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const L = await import("leaflet");

      // Fix for default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      // Default to Kigali, Rwanda if no coordinates
      const defaultLat = coords?.lat || -1.9403;
      const defaultLng = coords?.lng || 29.8739;

      const map = L.map(mapRef.current).setView([defaultLat, defaultLng], coords ? 15 : 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      if (coords) {
        L.marker([coords.lat, coords.lng])
          .addTo(map)
          .bindPopup(`<strong>${storeName}</strong><br/>${address}`)
          .openPopup();
      }

      mapInstanceRef.current = map;
      setMapLoaded(true);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coords, address, storeName]);

  // Try to geocode address if no coordinates provided
  useEffect(() => {
    if (coords || !address) return;

    const geocodeAddress = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          setCoords({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon),
          });
        }
      } catch (error) {
        console.error("Geocoding failed:", error);
      }
    };

    geocodeAddress();
  }, [address, coords]);

  const handleGetDirections = () => {
    if (coords) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`,
        "_blank"
      );
    } else {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
        "_blank"
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl overflow-hidden border h-80 relative">
        <div ref={mapRef} className="w-full h-full z-0" />
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{address}</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleGetDirections} className="gap-2">
          <Navigation className="h-4 w-4" />
          Get Directions
        </Button>
      </div>
    </div>
  );
};

export default StoreLocationMap;
