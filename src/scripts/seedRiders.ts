import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import { Rider } from '../models';

dotenv.config();

export function csvToArray<T = Record<string, string>>(fileName: string): T[] {
    const filePath = path.join(__dirname, fileName);
    const data = fs.readFileSync(filePath, 'utf-8');
  
    // Split the CSV content into lines and extract headers
    const [headerLine, ...lines] = data.trim().split('\n');
    const headers = headerLine.split(',').map(h => h.trim());
  
    // Convert each CSV line into an object
    const result: T[] = lines.map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj = headers.reduce((acc, header, i) => {
        acc[header] = values[i];
        return acc;
      }, {} as Record<string, string>);
      return obj as T;
    });
  
    return result;
  }

const seedDatabase = async () => {
  try {
    await connectDatabase();
    console.log('Connected to database');

    // Clear existing riders
    await Rider.deleteMany({});
    console.log('Cleared existing riders');

    // Insert new riders
    const riderData = csvToArray('rhfd_riders.csv');
    const riders = await Rider.insertMany(riderData);
    console.log(`Successfully seeded ${riders.length} riders`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

