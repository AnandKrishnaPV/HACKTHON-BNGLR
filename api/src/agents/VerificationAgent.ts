interface Route {
  distance: number;
  duration: number; // minutes
}

interface Cargo {
  weight: number;
  volume: number;
  deadline: Date;
}

interface Vehicle {
  payloadCapacity: number;
  cargoVolume: number;
}

export class VerificationAgent {
  /**
   * Performs final verification check on the selected route and shipment details.
   */
  verify(route: Route, cargo: Cargo, vehicle: Vehicle) {
    const checks = [];
    
    // Check 1: Weight Capacity
    const weightPass = cargo.weight <= vehicle.payloadCapacity;
    checks.push({
      type: 'PAYLOAD_LIMIT',
      limitValue: vehicle.payloadCapacity,
      actualValue: cargo.weight,
      status: weightPass ? 'PASS' : 'FAIL'
    });

    // Check 2: Volume Capacity
    const volumePass = cargo.volume <= vehicle.cargoVolume;
    checks.push({
      type: 'VOLUME_LIMIT',
      limitValue: vehicle.cargoVolume,
      actualValue: cargo.volume,
      status: volumePass ? 'PASS' : 'FAIL'
    });

    // Check 3: Deadline
    // Convert route duration (minutes) to milliseconds
    const durationMs = route.duration * 60 * 1000;
    const arrivalTime = Date.now() + durationMs;
    const deadlinePass = arrivalTime <= cargo.deadline.getTime();
    
    checks.push({
      type: 'DEADLINE_LIMIT',
      limitValue: cargo.deadline.getTime(),
      actualValue: arrivalTime,
      status: deadlinePass ? 'PASS' : 'FAIL'
    });

    const passed = weightPass && volumePass && deadlinePass;

    return {
      passed,
      checks,
      message: passed 
        ? 'Verification Agent: All routing and vehicle constraints successfully verified.' 
        : 'Verification Agent: Route validation failed due to constraint violations.'
    };
  }
}
