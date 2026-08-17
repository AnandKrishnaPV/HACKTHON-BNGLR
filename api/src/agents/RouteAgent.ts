import axios from 'axios';
import 'dotenv/config';

interface Coordinate {
  lat: number;
  lng: number;
}

interface RouteCandidate {
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
}

export class RouteAgent {
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.ROUTING_API_KEY;
  }

  /**
   * Geocodes an address string to coordinates.
   * Falls back to Nominatim (OpenStreetMap) if ORS key is not available.
   */
  async geocode(address: string): Promise<Coordinate> {
    try {
      if (this.apiKey) {
        // Use OpenRouteService Geocoding
        const response = await axios.get('https://api.openrouteservice.org/geocode/search', {
          params: {
            api_key: this.apiKey,
            text: address,
            size: 1
          }
        });
        
        const features = response.data.features;
        if (features && features.length > 0) {
          const [lng, lat] = features[0].geometry.coordinates;
          return { lat, lng };
        }
      }
      
      // Fallback to OSM Nominatim (Free, no key required)
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'Q-Swarm-Logistics-Agent/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        const item = response.data[0];
        return {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        };
      }

      throw new Error(`Location not found: "${address}"`);
    } catch (error: any) {
      console.error(`Geocoding failed for ${address}:`, error.message);
      throw new Error(`Geocoding failed for "${address}": ${error.message}`);
    }
  }

  /**
   * Generates candidate routes between coordinates using OpenRouteService.
   */
  async getRouteCandidates(
    origin: Coordinate,
    destination: Coordinate,
    stops: Coordinate[] = []
  ): Promise<RouteCandidate[]> {
    if (!this.apiKey) {
      throw new Error('Routing Service unavailable - please configure ROUTING_API_KEY in .env');
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
          totalCost: 0
        };
      });

      return candidates;
    } catch (error: any) {
      console.error('Routing failed:', error.response?.data || error.message);
      throw new Error(`Routing Service failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }
}
