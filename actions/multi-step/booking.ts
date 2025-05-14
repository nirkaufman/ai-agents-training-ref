/**********************
 Simple tools to drive the business logic
************************/
import {BookedFlight, Flight, FlightInformation, UserInfo} from "@/actions/multi-step/types";

// Simulate API latency
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


let flightData: Flight[] = [];


// Mock function that search for flights
// This function is used in the first step of the multistep flow.
export const searchFlights = async (origin: string, destination: string, date: string): Promise<Flight[]> => {
  await delay(2000);

  flightData = [
    {
      id: '1',
      flightNumber: 'AA123',
      origin: origin,
      destination: destination,
      date: date,
      departureTime: '08:00 AM',
      arrivalTime: '10:30 AM',
      price: 299.99,
      airline: 'American Airlines',
    },
    {
      id: '2',
      flightNumber: 'AA456',
      origin: origin,
      destination: destination,
      date: date,
      departureTime: '11:00 AM',
      arrivalTime: '13:30 PM',
      price: 349.99,
      airline: 'American Airlines',
    },
    {
      id: '3',
      flightNumber: 'UA789',
      origin: origin,
      destination: destination,
      date: date,
      departureTime: '14:00 PM',
      arrivalTime: '16:30 PM',
      price: 279.99,
      airline: 'United Airlines',
    },
    {
      id: '4',
      flightNumber: 'DL321',
      origin: origin,
      destination: destination,
      date: date,
      departureTime: '17:00 PM',
      arrivalTime: '19:30 PM',
      price: 399.99,
      airline: 'Delta Airlines',
    }
  ];

  return flightData;
};


// Mock function that looks up flight details
// This function is used in the second step of the multistep flow.
export const lookupFlight = async (flightNumber: string): Promise<FlightInformation> => {
  await delay(1000);

  const flightDetails: Flight | any = flightData.find(flight => flight.flightNumber === flightNumber) || {};

  return {
    ...flightDetails,
    availableSeats: 12,
    bookingStatus: 'Available',
  };
};


// Mock function that book a flight
// This function is used in the third step of the multistep flow.
export const bookFlight = async (flightNumber: string, passengerName: string): Promise<BookedFlight> => {
  await delay(1000);

  const flightDetails: Flight | any = flightData.find(flight => flight.flightNumber === flightNumber) || {};

  return {
    ...flightDetails,
    bookingRef: 'JH234X',
    passengerName
  }
}


// Mock function that confirms a booking
// This function is used in the fourth step of the multistep flow.
export const bookingConfirmation = async (destination: string): Promise<string> => {
  await delay(500);
  return `Your flight to ${destination} has been booked. an email has been sent to you.`;
};
