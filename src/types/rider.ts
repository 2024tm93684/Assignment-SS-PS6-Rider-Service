// Type definitions for Rider
export interface RiderInput {
  name: string;
  email: string;
  phone: string;
}

export interface RiderResponse {
  _id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

