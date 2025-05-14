import {z} from 'zod';

// utility to use TypeScript types with zod
export function createSchemaFromInterface<T>() {
  return <S extends z.ZodType<T, any, any>>(schema: S) => schema;
}

export interface Flight {
  id: string;
  origin: string;
  destination: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
  flightNumber: string;
  price: number;
}

export interface FlightInformation extends Flight {
  availableSeats: number;
  bookingStatus: string;
}


export interface UserInfo {
  firstName: string;
  lastName: string;
  passportNumber: string;
  email: string;
  phone: string;
}


export interface BookedFlight extends Flight{
  bookingRef: string
  passengerName: string;
}

