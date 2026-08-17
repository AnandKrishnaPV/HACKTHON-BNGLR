import { prisma } from '../db';
import 'dotenv/config';

interface CargoSpecs {
  weight: number; // kg
  volume: number; // m³
}

interface ValidationResult {
  valid: boolean;
  message: string;
}

export class VehicleAgent {
  private fuelPrice: number;

  constructor() {
    // Default diesel price per litre in India (INR) or USD equivalent
    this.fuelPrice = parseFloat(process.env.FUEL_PRICE_PER_LITRE || '94.50'); 
  }

  /**
   * Fetches specs for a vehicle model from database.
   */
  async getVehicleSpecs(model: string) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { model }
    });
    
    if (!vehicle) {
      throw new Error(`Vehicle model not found in database: "${model}"`);
    }
    
    return vehicle;
  }

  /**
   * Validates if the selected vehicle can carry the cargo weight and volume.
   */
  validateCapacity(vehicle: any, cargo: CargoSpecs): ValidationResult {
    if (cargo.weight > vehicle.payloadCapacity) {
      return {
        valid: false,
        message: `Vehicle cannot safely transport this shipment. Cargo weight (${cargo.weight.toLocaleString()} kg) exceeds vehicle payload capacity (${vehicle.payloadCapacity.toLocaleString()} kg). Select a vehicle with higher payload capacity.`
      };
    }

    if (cargo.volume > vehicle.cargoVolume) {
      return {
        valid: false,
        message: `Vehicle cannot safely transport this shipment. Cargo volume (${cargo.volume} m³) exceeds vehicle cargo volume capacity (${vehicle.cargoVolume} m³). Select a vehicle with higher cargo capacity.`
      };
    }

    return {
      valid: true,
      message: 'Vehicle capacity check passed.'
    };
  }

  /**
   * Calculates estimated fuel, cost, and CO2 emissions for a route distance.
   */
  calculateMetrics(vehicle: any, distanceKm: number) {
    // fuel consumption is in L/100km
    const fuelConsumptionLiters = (distanceKm * vehicle.fuelConsumption) / 100;
    const fuelCost = fuelConsumptionLiters * this.fuelPrice;
    
    // CO2 Emissions = fuel consumed * emission factor
    const co2EmissionsKg = fuelConsumptionLiters * vehicle.co2EmissionFactor;

    return {
      fuelConsumption: parseFloat(fuelConsumptionLiters.toFixed(2)),
      fuelCost: parseFloat(fuelCost.toFixed(2)),
      co2Emissions: parseFloat(co2EmissionsKg.toFixed(2)),
      tollCost: 0, // Set to 0 representing "Toll estimate unavailable" or config later
      totalCost: parseFloat(fuelCost.toFixed(2)) // fuel cost + tolls (0 for now)
    };
  }
}
