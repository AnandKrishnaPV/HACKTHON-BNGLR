import axios from 'axios';
import 'dotenv/config';

interface RouteCandidate {
  id: string;
  name: string;
  distance: number;
  duration: number;
  fuelConsumption: number;
  fuelCost: number;
  tollCost: number;
  co2Emissions: number;
  totalCost: number;
}

interface OptimizationWeights {
  cost: number;
  time: number;
  fuel: number;
  co2: number;
  tolls: number;
}

export class QuantumOptimizationAgent {
  private serviceUrl: string;

  constructor() {
    const hostport = process.env.OPTIMIZATION_SERVICE_HOST;
    this.serviceUrl = process.env.OPTIMIZATION_SERVICE_URL || (hostport ? `http://${hostport}` : 'http://localhost:8000');
  }

  /**
   * Submits candidate routes and weights to the Qiskit optimization microservice.
   */
  async runOptimization(routes: RouteCandidate[], weights: OptimizationWeights) {
    try {
      const response = await axios.post(`${this.serviceUrl}/optimize`, {
        routes: routes,
        weights: weights
      });

      return response.data;
    } catch (error: any) {
      console.error('Quantum Optimization Service failed:', error.message);
      throw new Error(`Quantum Solver failed: ${error.response?.data?.detail || error.message}`);
    }
  }
}
