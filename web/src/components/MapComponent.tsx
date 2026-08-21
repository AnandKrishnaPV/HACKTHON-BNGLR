'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';

interface Coordinate {
  lat: number;
  lng: number;
}

interface Stop {
  name: string;
  lat: number;
  lng: number;
}

interface TollGate {
  name: string;
  price: number;
  lat: number;
  lng: number;
}

interface Route {
  id: string;
  name: string;
  geometry: string; // JSON GeoJSON string
  isSelected: boolean;
  distance: number;
  tollGates?: TollGate[];
}

interface MapProps {
  origin: Coordinate | null;
  destination: Coordinate | null;
  stops?: Stop[];
  routes?: Route[];
  onTollIntersect?: (toll: TollGate) => void;
}


export default function MapComponent({ origin, destination, stops = [], routes = [], onTollIntersect }: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routesRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    // Make sure window is defined and container exists
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Fix default marker icon paths in Leaflet
    // Leaflet's default icon assets can be missing/broken in bundlers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    });

    // Create Map if not created yet
    if (!mapRef.current) {
      const initialLat = origin?.lat || 12.9716; // default Bangalore
      const initialLng = origin?.lng || 77.5946;
      
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 12,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Add modern CartoDB Positron / Voyage tiles (clean light grey tiles)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
      }).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);
      routesRef.current = L.layerGroup().addTo(map);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers and routes when props change
  useEffect(() => {
    const map = mapRef.current;
    const markersGroup = markersRef.current;
    const routesGroup = routesRef.current;

    if (!map || !markersGroup || !routesGroup) return;

    // Clear old drawings
    markersGroup.clearLayers();
    routesGroup.clearLayers();

    const bounds: L.LatLngExpression[] = [];

    // Custom Icon Creators
    const createCustomIcon = (color: string, label: string) => {
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background-color: ${color}; 
            color: white; 
            border: 2px solid white; 
            border-radius: 50%; 
            width: 28px; 
            height: 28px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.15);
            font-size: 11px;
            font-weight: bold;
          ">
            ${label}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
    };

    // 1. Add Origin Marker
    if (origin) {
      L.marker([origin.lat, origin.lng], {
        icon: createCustomIcon('#72B844', 'A')
      })
      .bindPopup(`<b>Origin</b><br/>Lat: ${origin.lat.toFixed(4)}<br/>Lng: ${origin.lng.toFixed(4)}`)
      .addTo(markersGroup);
      
      bounds.push([origin.lat, origin.lng]);
    }

    // 2. Add Stops Markers
    stops.forEach((stop, i) => {
      L.marker([stop.lat, stop.lng], {
        icon: createCustomIcon('#CF7643', `${i + 1}`)
      })
      .bindPopup(`<b>Stop ${i + 1}: ${stop.name}</b>`)
      .addTo(markersGroup);
      
      bounds.push([stop.lat, stop.lng]);
    });

    // 3. Add Destination Marker
    if (destination) {
      L.marker([destination.lat, destination.lng], {
        icon: createCustomIcon('#70C0FF', 'B')
      })
      .bindPopup(`<b>Destination</b><br/>Lat: ${destination.lat.toFixed(4)}<br/>Lng: ${destination.lng.toFixed(4)}`)
      .addTo(markersGroup);
      
      bounds.push([destination.lat, destination.lng]);
    }

    // 4. Draw Route Polylines
    const colors = ['#72B844', '#3B82F6', '#8B5CF6', '#F59E0B'];
    let selectedCount = 0;

    routes.forEach((route) => {
      try {
        const geojson = JSON.parse(route.geometry);
        // GeoJSON coordinates are [longitude, latitude]
        const latLngs = geojson.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);

        let routeColor = '#94A3B8';
        if (route.isSelected) {
          routeColor = colors[selectedCount % colors.length];
          selectedCount++;
        }

        const polyline = L.polyline(latLngs, {
          color: routeColor,
          weight: route.isSelected ? 5 : 3,
          opacity: route.isSelected ? 0.9 : 0.4,
          dashArray: route.isSelected ? undefined : '5, 10'
        });

        polyline.bindPopup(`<b>${route.name}</b><br/>Distance: ${route.distance} km`);
        polyline.addTo(routesGroup);

        if (route.isSelected && latLngs.length > 0) {
          latLngs.forEach((pt: L.LatLngExpression) => bounds.push(pt));
          
          // Render Toll Gates for selected route
          if (route.tollGates) {
            route.tollGates.forEach(toll => {
              L.marker([toll.lat, toll.lng], {
                icon: createCustomIcon('#F59E0B', '$') // Amber color for tolls
              })
              .bindPopup(`<b>${toll.name}</b><br/>Toll Fee: ${toll.price.toFixed(2)} USDC`)
              .addTo(routesGroup);
              bounds.push([toll.lat, toll.lng]);
            });
          }

          // Autonomous Vehicle Tracking & Smart Contract Toll Execution
          if (latLngs.length > 0) {
            const truckIcon = L.divIcon({
              html: `<div style="
                background-color: ${routeColor}; 
                color: white; 
                border-radius: 5px; 
                width: 20px; 
                height: 14px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8px;
                font-weight: bold;
              ">🚚</div>`,
              className: '',
              iconSize: [20, 14],
              iconAnchor: [10, 7]
            });
            
            const truckMarker = L.marker(latLngs[0] as L.LatLngExpression, { icon: truckIcon }).addTo(routesGroup);
            
            let currentStep = 0;
            const stepCount = latLngs.length;
            const speed = 40 + Math.random() * 30; // ms per step (randomized for swarm effect)
            const initialDelay = 1500 + Math.random() * 1000;
            
            // Track triggered tolls to avoid duplicate payments
            const triggeredTolls = new Set<string>();

            const animateTruck = () => {
              if (currentStep >= stepCount) return;
              
              const pos = latLngs[currentStep] as [number, number];
              truckMarker.setLatLng(pos);
              
              // Check proximity to toll gates (distance in coords, rough estimate for demo)
              if (route.tollGates && onTollIntersect) {
                route.tollGates.forEach(toll => {
                  const dist = Math.sqrt(Math.pow(pos[0] - toll.lat, 2) + Math.pow(pos[1] - toll.lng, 2));
                  if (dist < 0.01 && !triggeredTolls.has(toll.name)) {
                    triggeredTolls.add(toll.name);
                    onTollIntersect(toll);
                  }
                });
              }
              
              currentStep += 1;
              setTimeout(animateTruck, speed);
            };
            
            // Start animation after a short delay
            setTimeout(animateTruck, initialDelay);
          }
        }
      } catch (err) {
        console.error('Failed to parse route geometry:', err);
      }
    });

    // Fit map bounds to show all elements
    if (bounds.length > 0) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, {
        padding: [50, 50],
        maxZoom: 14,
        animate: true,
        duration: 1.0
      });
    }
  }, [origin, destination, stops, routes]);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%', minHeight: '350px' }} />;
}
