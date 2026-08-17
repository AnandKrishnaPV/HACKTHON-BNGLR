import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const vehicles = [
  {
    manufacturer: 'Tata Motors',
    model: 'Tata Prima 5530.S',
    sector: 'Heavy Transport',
    imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80',
    type: 'Heavy Duty Trailer',
    fuelType: 'Diesel',
    payloadCapacity: 30000.0, // kg
    gvwr: 55000.0,            // kg
    fuelConsumption: 35.0,     // L/100km
    fuelTankCapacity: 400.0,   // L
    cargoVolume: 80.0,         // m³
    maxSpeed: 90.0,            // km/h
    avgSpeed: 65.0,            // km/h
    co2EmissionFactor: 2.68,   // kg CO2 per Litre of Diesel
    isSystemData: true,
  },
  {
    manufacturer: 'Ashok Leyland',
    model: 'Ecomet 1615 HE',
    sector: 'Intermediate Freight',
    imageUrl: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800&q=80',
    type: 'Intermediate Commercial Vehicle',
    fuelType: 'Diesel',
    payloadCapacity: 10500.0, // kg
    gvwr: 16100.0,            // kg
    fuelConsumption: 22.0,     // L/100km
    fuelTankCapacity: 185.0,   // L
    cargoVolume: 32.0,         // m³
    maxSpeed: 80.0,            // km/h
    avgSpeed: 55.0,            // km/h
    co2EmissionFactor: 2.68,   // kg CO2 per Litre of Diesel
    isSystemData: true,
  },
  {
    manufacturer: 'Mahindra',
    model: 'Furio 14',
    sector: 'Light Delivery',
    imageUrl: 'https://images.unsplash.com/photo-1552345388-782e443ce3f4?w=800&q=80',
    type: 'Light Truck',
    fuelType: 'Diesel',
    payloadCapacity: 8500.0,  // kg
    gvwr: 14000.0,            // kg
    fuelConsumption: 16.0,     // L/100km
    fuelTankCapacity: 190.0,   // L
    cargoVolume: 24.0,         // m³
    maxSpeed: 80.0,            // km/h
    avgSpeed: 50.0,            // km/h
    co2EmissionFactor: 2.68,   // kg CO2 per Litre of Diesel
    isSystemData: true,
  },
  {
    manufacturer: 'Tata Motors',
    model: 'Tata Ace Gold',
    sector: 'Last-Mile Delivery',
    imageUrl: 'https://images.unsplash.com/photo-1588614488390-349071b78294?w=800&q=80',
    type: 'Mini Truck',
    fuelType: 'Diesel',
    payloadCapacity: 750.0,   // kg
    gvwr: 1615.0,             // kg
    fuelConsumption: 6.5,      // L/100km
    fuelTankCapacity: 30.0,    // L
    cargoVolume: 4.5,          // m³
    maxSpeed: 60.0,            // km/h
    avgSpeed: 40.0,            // km/h
    co2EmissionFactor: 2.68,   // kg CO2 per Litre of Diesel
    isSystemData: true,
  },
];

async function main() {
  console.log('Seeding initial vehicle specifications...');
  for (const vehicle of vehicles) {
    const record = await prisma.vehicle.upsert({
      where: { model: vehicle.model },
      update: vehicle,
      create: vehicle,
    });
    console.log(`Upserted vehicle: ${record.manufacturer} ${record.model}`);
  }
  console.log('Vehicle seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
