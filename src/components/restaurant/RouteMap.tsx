import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Loader2 } from 'lucide-react';

interface RouteStop {
  id: string;
  name: string;
  cuisine: string;
  lat: number;
  lng: number;
  address: string;
  order: number;
}

interface RouteMapProps {
  routeId: string;
  routeName: string;
  stops?: RouteStop[];
}

const RouteMap = ({ routeId, routeName, stops = [] }: RouteMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);

  useEffect(() => {
    const fetchRouteStops = async () => {
      try {
        // Get route stops with restaurant data
        const { data: routeStopsData, error: stopsError } = await supabase
          .from('route_stops')
          .select(`
            *,
            restaurants (
              id, name, cuisine_type, lat, lng, address
            )
          `)
          .eq('route_id', routeId)
          .order('order_index');

        if (stopsError) throw stopsError;

        const formattedStops = routeStopsData?.map((stop: any, index: number) => ({
          id: stop.restaurant_id,
          name: stop.restaurants.name,
          cuisine: stop.restaurants.cuisine_type,
          lat: parseFloat(stop.restaurants.lat),
          lng: parseFloat(stop.restaurants.lng),
          address: stop.restaurants.address,
          order: stop.order_index || index + 1
        })) || [];

        setRouteStops(formattedStops);
      } catch (err) {
        console.error('Error fetching route stops:', err);
        // Fallback to default Pedersgata restaurants if no route stops found
        setRouteStops([
          {
            id: '1',
            name: 'Restaurant K2',
            cuisine: 'Moderne nordisk',
            lat: 58.9731,
            lng: 5.7346,
            address: 'Pedersgata 32, Stavanger',
            order: 1
          },
          {
            id: '2', 
            name: 'Sabi Omakase',
            cuisine: 'Japansk sushi',
            lat: 58.9715,
            lng: 5.7335,
            address: 'Pedersgata 28, Stavanger',
            order: 2
          },
          {
            id: '3',
            name: 'Bravo',
            cuisine: 'Moderne europeisk',
            lat: 58.9720,
            lng: 5.7340,
            address: 'Pedersgata 30, Stavanger',
            order: 3
          }
        ]);
      }
    };

    fetchRouteStops();
  }, [routeId]);

  useEffect(() => {
    const initializeMap = async () => {
      if (routeStops.length === 0) return;

      try {
        setIsLoading(true);
        setError(null);

        // Get Google Maps API key from edge function
        const { data: configData, error: configError } = await supabase.functions.invoke('get-maps-config');
        
        if (configError || !configData?.success) {
          throw new Error(configData?.error || 'Failed to get maps configuration');
        }

        const loader = new Loader({
          apiKey: configData.apiKey,
          version: 'weekly',
          libraries: ['geometry', 'drawing']
        });

        const { Map } = await loader.importLibrary('maps');
        const { DirectionsService, DirectionsRenderer } = await loader.importLibrary('routes');

        if (!mapRef.current) return;

        // Create map centered on Stavanger
        const map = new Map(mapRef.current, {
          center: { lat: 58.9718, lng: 5.7341 },
          zoom: 16,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ],
          mapTypeControl: false,
          fullscreenControl: false
        });

        mapInstanceRef.current = map;

        // Create markers for each stop
        const markers: google.maps.Marker[] = [];
        const infoWindows: google.maps.InfoWindow[] = [];

        routeStops.forEach((stop, index) => {
          const marker = new google.maps.Marker({
            position: { lat: stop.lat, lng: stop.lng },
            map: map,
            title: stop.name,
            label: {
              text: (index + 1).toString(),
              color: 'white',
              fontWeight: 'bold'
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 20,
              fillColor: index === 0 ? '#4ade80' : index === routeStops.length - 1 ? '#ef4444' : '#3b82f6',
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 3
            }
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-semibold text-sm">${stop.name}</h3>
                <p class="text-xs text-gray-600">${stop.cuisine}</p>
                <p class="text-xs text-gray-500 mt-1">${stop.address}</p>
                <div class="mt-2 text-xs">
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Stop ${index + 1}
                  </span>
                </div>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindows.forEach(iw => iw.close());
            infoWindow.open(map, marker);
          });

          markers.push(marker);
          infoWindows.push(infoWindow);
        });

        // Create walking route if more than one stop
        if (routeStops.length > 1) {
          const directionsService = new DirectionsService();
          const directionsRenderer = new DirectionsRenderer({
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: '#059669',
              strokeWeight: 4,
              strokeOpacity: 0.8
            }
          });

          directionsRenderer.setMap(map);

          const waypoints = routeStops.slice(1, -1).map(stop => ({
            location: { lat: stop.lat, lng: stop.lng },
            stopover: true
          }));

          directionsService.route({
            origin: { lat: routeStops[0].lat, lng: routeStops[0].lng },
            destination: { lat: routeStops[routeStops.length - 1].lat, lng: routeStops[routeStops.length - 1].lng },
            waypoints: waypoints,
            travelMode: google.maps.TravelMode.WALKING
          }, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK && result) {
              directionsRenderer.setDirections(result);
            }
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setIsLoading(false);
      }
    };

    initializeMap();
  }, [routeStops]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Rutekart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Laster kart...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Rutekart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
            <div className="text-center text-destructive">
              <MapPin className="w-8 h-8 mx-auto mb-4" />
              <p className="font-medium">Kunne ikke laste kart</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Rutekart - {routeName}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Klikk på markørene for å se detaljer om hvert stopp
        </p>
      </CardHeader>
      <CardContent>
        <div ref={mapRef} className="h-96 w-full rounded-lg" />
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Stopp</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Slutt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-emerald-600"></div>
            <span>Gårute</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteMap;