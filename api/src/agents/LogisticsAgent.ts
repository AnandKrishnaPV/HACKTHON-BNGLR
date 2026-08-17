interface ShipmentInput {
  origin: string;
  destination: string;
  cargoDescription: string;
  cargoWeight: number;
  cargoVolume: number;
  packages: number;
  deadline: string;
  fragile?: boolean;
  temperatureControlled?: boolean;
  hazardous?: boolean;
}

export class LogisticsAgent {
  /**
   * Parses natural language input and validates shipment details.
   */
  validateAndStructure(input: ShipmentInput) {
    if (!input.origin || input.origin.trim() === '') {
      throw new Error('Logistics Agent: Origin is required');
    }
    if (!input.destination || input.destination.trim() === '') {
      throw new Error('Logistics Agent: Destination is required');
    }
    if (!input.cargoDescription || input.cargoDescription.trim() === '') {
      throw new Error('Logistics Agent: Cargo description is required');
    }
    
    // Weight validations
    if (input.cargoWeight <= 0) {
      throw new Error('Logistics Agent: Cargo weight must be greater than 0 kg');
    }
    
    // Volume validations
    if (input.cargoVolume <= 0) {
      throw new Error('Logistics Agent: Cargo volume must be greater than 0 m³');
    }

    // Packages validation
    if (input.packages <= 0) {
      throw new Error('Logistics Agent: Number of packages must be at least 1');
    }

    // Deadline validation
    const deadlineDate = new Date(input.deadline);
    if (isNaN(deadlineDate.getTime())) {
      throw new Error('Logistics Agent: Invalid delivery deadline date format');
    }
    if (deadlineDate.getTime() < Date.now()) {
      throw new Error('Logistics Agent: Delivery deadline cannot be in the past');
    }

    return {
      origin: input.origin.trim(),
      destination: input.destination.trim(),
      cargo: {
        description: input.cargoDescription.trim(),
        weight: input.cargoWeight,
        volume: input.cargoVolume,
        packages: input.packages,
        deadline: deadlineDate,
        fragile: !!input.fragile,
        temperatureControlled: !!input.temperatureControlled,
        hazardous: !!input.hazardous
      }
    };
  }
}
