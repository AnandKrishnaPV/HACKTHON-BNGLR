import axios from 'axios';
import 'dotenv/config';

interface Coordinate {
  lat: number;
  lng: number;
}

interface TollGate {
  name: string;
  price: number;
  lat: number;
  lng: number;
}

export interface RouteCandidate {
  id: string;
  name: string;
  distance: number; // km
  duration: number; // minutes
  geometry: string; // JSON GeoJSON string
  fuelConsumption: number;
  fuelCost: number;
  tollCost: number;
  co2Emissions: number;
  totalCost: number;
  tollGates?: TollGate[];
}


export class RouteAgent {
  private apiKey: string | undefined;

  // Local lookup table for common Indian cities — works without any external API
  private static readonly CITY_COORDS: Record<string, Coordinate> = {
    // Karnataka
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'bengaluru': { lat: 12.9716, lng: 77.5946 },
    'electronic city': { lat: 12.8399, lng: 77.6770 },
    'electronic city, bangalore': { lat: 12.8399, lng: 77.6770 },
    'whitefield': { lat: 12.9698, lng: 77.7500 },
    'whitefield, bangalore': { lat: 12.9698, lng: 77.7500 },
    'mysore': { lat: 12.2958, lng: 76.6394 },
    'mysuru': { lat: 12.2958, lng: 76.6394 },
    'hubli': { lat: 15.3647, lng: 75.1240 },
    'mangalore': { lat: 12.9141, lng: 74.8560 },
    // Tamil Nadu
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'coimbatore': { lat: 11.0168, lng: 76.9558 },
    'madurai': { lat: 9.9252, lng: 78.1198 },
    // Maharashtra
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'pune': { lat: 18.5204, lng: 73.8567 },
    'nagpur': { lat: 21.1458, lng: 79.0882 },
    // Delhi / NCR
    'delhi': { lat: 28.7041, lng: 77.1025 },
    'new delhi': { lat: 28.6139, lng: 77.2090 },
    'gurgaon': { lat: 28.4595, lng: 77.0266 },
    'noida': { lat: 28.5355, lng: 77.3910 },
    // Gujarat
    'ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'surat': { lat: 21.1702, lng: 72.8311 },
    // Rajasthan
    'jaipur': { lat: 26.9124, lng: 75.7873 },
    // Telangana
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    // West Bengal
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    // Kerala
    'kochi': { lat: 9.9312, lng: 76.2673 },
    'thiruvananthapuram': { lat: 8.5241, lng: 76.9366 },
    // Uttar Pradesh
    'lucknow': { lat: 26.8467, lng: 80.9462 },
    'kanpur': { lat: 26.4499, lng: 80.3319 },
    // Punjab
    'chandigarh': { lat: 30.7333, lng: 76.7794 },
    'amritsar': { lat: 31.6340, lng: 74.8723 },
    // Ports / Hubs
    'port of mumbai': { lat: 18.9400, lng: 72.8347 },
    'nhava sheva': { lat: 18.9483, lng: 72.9445 },
    'chennai port': { lat: 13.0900, lng: 80.2923 },
  };

  constructor() {
    this.apiKey = process.env.ROUTING_API_KEY;
  }

  /**
   * Looks up coordinates from the local city table.
   * Matches on any substring of the address (case-insensitive).
   */
  private localLookup(address: string): Coordinate | null {
    const lower = address.toLowerCase().trim();
    // Exact match first
    if (RouteAgent.CITY_COORDS[lower]) return RouteAgent.CITY_COORDS[lower];
    // Substring match
    for (const [key, coord] of Object.entries(RouteAgent.CITY_COORDS)) {
      if (lower.includes(key) || key.includes(lower)) return coord;
    }
    return null;
  }

  /**
   * Geocodes an address string to coordinates.
   * Priority: ORS API → Nominatim → Local lookup table.
   */
  async geocode(address: string): Promise<Coordinate> {
    // 1. Try local table first (instant, no network required)
    const local = this.localLookup(address);

    try {
      if (this.apiKey) {
        // Use OpenRouteService Geocoding
        const response = await axios.get('https://api.openrouteservice.org/geocode/search', {
          params: { api_key: this.apiKey, text: address, size: 1 },
          timeout: 5000,
        });
        const features = response.data.features;
        if (features && features.length > 0) {
          const [lng, lat] = features[0].geometry.coordinates;
          return { lat, lng };
        }
      }

      // Fallback to OSM Nominatim (Free, no key required)
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q: address, format: 'json', limit: 1 },
        headers: { 'User-Agent': 'Q-Swarm-Logistics-Agent/1.0' },
        timeout: 5000,
      });

      if (response.data && response.data.length > 0) {
        const item = response.data[0];
        return { lat: parseFloat(item.lat), lng: parseFloat(item.lon) };
      }

      // Return local lookup if external APIs fail
      if (local) {
        console.log(`Using local coordinate fallback for: ${address}`);
        return local;
      }

      throw new Error(`Location not found: "${address}"`);
    } catch (error: any) {
      // If network fails, try local lookup before giving up
      if (local) {
        console.log(`Network geocoding failed, using local fallback for: ${address}`);
        return local;
      }
      console.error(`Geocoding failed for ${address}:`, error.message);
      throw new Error(`Geocoding failed for "${address}": ${error.message}`);
    }
  }

  /**
   * Generates simulated routes when no ORS API key is available.
   * Computes distances using the Haversine formula and adds realistic variance for alternatives.
   */
  private generateMockTollGates(distanceKm: number, coordinates: number[][]): TollGate[] {
    const numTolls = Math.max(1, Math.floor(distanceKm / 10)); // Ensure at least 1 toll for demo
    const tollGates: TollGate[] = [];
    const gateNames = ['NICE Road Toll', 'NH Highway Plaza', 'City Bypass Toll', 'Expressway Toll', 'Border Post'];
    
    for (let i = 1; i <= numTolls; i++) {
      const fraction = i / (numTolls + 1);
      const targetIndex = Math.floor((coordinates.length - 1) * fraction);
      const coord = coordinates[targetIndex];
      
      if (coord && coord.length >= 2) {
        tollGates.push({
          name: gateNames[i % gateNames.length] + ` Gate ${i}`,
          price: Math.floor(Math.random() * 50) + 40,
          lat: parseFloat(coord[1].toFixed(5)),
          lng: parseFloat(coord[0].toFixed(5))
        });
      }
    }
    return tollGates;
  }

  private generateSimulatedRoutes(origin: Coordinate, destination: Coordinate): RouteCandidate[] {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371; // Earth radius km
    const dLat = toRad(destination.lat - origin.lat);
    const dLng = toRad(destination.lng - origin.lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(origin.lat)) * Math.cos(toRad(destination.lat)) * Math.sin(dLng / 2) ** 2;
    const baseDistance = parseFloat((R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.35).toFixed(2)); // 1.35 road factor


    const avgSpeed = 50; // km/h city+highway mix
    const now = Date.now();

    return [
      {
        id: `route_1_${now}`,
        name: 'Route A (Fastest)',
        distance: baseDistance,
        duration: Math.round((baseDistance / avgSpeed) * 60),
        geometry: JSON.stringify({
          type: 'LineString',
          coordinates: [[origin.lng, origin.lat], [destination.lng, destination.lat]]
        }),
        fuelConsumption: 0, fuelCost: 0, tollCost: 0, co2Emissions: 0, totalCost: 0,
        tollGates: this.generateMockTollGates(baseDistance, [[origin.lng, origin.lat], [destination.lng, destination.lat]])
      },
      {
        id: `route_2_${now}`,
        name: 'Route B (Shortest)',
        distance: parseFloat((baseDistance * 0.92).toFixed(2)),
        duration: Math.round((baseDistance * 0.92 / (avgSpeed * 0.85)) * 60),
        geometry: JSON.stringify({
          type: 'LineString',
          coordinates: [[origin.lng, origin.lat], [(origin.lng + destination.lng) / 2, (origin.lat + destination.lat) / 2 + 0.05], [destination.lng, destination.lat]]
        }),
        fuelConsumption: 0, fuelCost: 0, tollCost: 0, co2Emissions: 0, totalCost: 0,
        tollGates: this.generateMockTollGates(baseDistance * 0.92, [[origin.lng, origin.lat], [(origin.lng + destination.lng) / 2, (origin.lat + destination.lat) / 2 + 0.05], [destination.lng, destination.lat]])
      },
      {
        id: `route_3_${now}`,
        name: 'Route C (Alternative)',
        distance: parseFloat((baseDistance * 1.12).toFixed(2)),
        duration: Math.round((baseDistance * 1.12 / (avgSpeed * 1.1)) * 60),
        geometry: JSON.stringify({
          type: 'LineString',
          coordinates: [[origin.lng, origin.lat], [(origin.lng + destination.lng) / 2, (origin.lat + destination.lat) / 2 - 0.05], [destination.lng, destination.lat]]
        }),
        fuelConsumption: 0, fuelCost: 0, tollCost: 0, co2Emissions: 0, totalCost: 0,
        tollGates: this.generateMockTollGates(baseDistance * 1.12, [[origin.lng, origin.lat], [(origin.lng + destination.lng) / 2, (origin.lat + destination.lat) / 2 - 0.05], [destination.lng, destination.lat]])
      }
    ];
  }

  /**
   * Generates candidate routes between coordinates using OpenRouteService.
   * Falls back to simulated routes if no API key is configured.
   */
  async getRouteCandidates(
    origin: Coordinate,
    destination: Coordinate,
    stops: Coordinate[] = []
  ): Promise<RouteCandidate[]> {
    if (!this.apiKey) {
      console.log('No ROUTING_API_KEY set — using simulated route candidates.');
      return this.generateSimulatedRoutes(origin, destination);
    }

    try {
      // Gather all coordinates in order: origin -> stops -> destination
      // OpenRouteService expects coordinates as [longitude, latitude]
      const coordinates = [
        [origin.lng, origin.lat],
        ...stops.map(s => [s.lng, s.lat]),
        [destination.lng, destination.lat]
      ];

      // OpenRouteService only supports alternative_routes if waypoints <= 2
      const requestBody: any = {
        coordinates: coordinates
      };
      
      if (coordinates.length <= 2) {
        requestBody.alternative_routes = {
          target_count: 3,
          weight_factor: 1.4
        };
      }

      let response;
      try {
        // Request directions from OpenRouteService
        response = await axios.post(
          'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
          requestBody,
          {
            headers: {
              Authorization: this.apiKey,
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (apiError: any) {
        const errorMsg = apiError.response?.data?.error?.message || '';
        // If ORS rejects because distance > 100km with alternative routes, retry without them
        if (requestBody.alternative_routes && (errorMsg.includes('alternative') || errorMsg.includes('100000.0'))) {
          console.warn('ORS rejected alternative routes (likely distance > 100km limit). Retrying without alternative routes...');
          delete requestBody.alternative_routes;
          response = await axios.post(
            'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
            requestBody,
            {
              headers: {
                Authorization: this.apiKey,
                'Content-Type': 'application/json'
              }
            }
          );
        } else {
          throw apiError;
        }
      }

      const features = response.data.features;
      if (!features || features.length === 0) {
        throw new Error('No routes returned from Routing API');
      }

      // OpenRouteService returns multiple features representing alternative routes when requested
      const candidates: RouteCandidate[] = features.map((feature: any, index: number) => {
        const summary = feature.properties.summary;
        const distance = summary.distance / 1000; // convert meters to km
        const duration = summary.duration / 60;   // convert seconds to minutes
        
        // Define route name
        let name = `Route ${String.fromCharCode(65 + index)}`;
        if (index === 0) name += ' (Fastest)';
        else if (index === 1) name += ' (Shortest)';
        else name += ' (Alternative)';

        return {
          id: `route_${index + 1}_${Date.now()}`,
          name: name,
          distance: parseFloat(distance.toFixed(2)),
          duration: Math.round(duration),
          geometry: JSON.stringify(feature.geometry),
          // Initial placeholders for vehicle metrics (calculated in Phase 3)
          fuelConsumption: 0,
          fuelCost: 0,
          tollCost: 0,
          co2Emissions: 0,
          totalCost: 0,
          tollGates: this.generateMockTollGates(distance, feature.geometry.coordinates)
        };
      });

      return candidates;
    } catch (error: any) {
      console.warn('OpenRouteService routing error, falling back to simulated candidates:', error.response?.data?.error?.message || error.message);
      return this.generateSimulatedRoutes(origin, destination);
    }
  }
}
