'use server'

import {streamUI} from 'ai/rsc';
import {openai} from '@ai-sdk/openai';
import {z} from 'zod';

import {delay, searchFlights, lookupFlight, bookFlight, bookingConfirmation} from './booking';
import {
  LoadingSpinner,
  FlightSearchResults,
  FlightDetails,
  FlightTicket,
  CollectUserInfoForBooking
} from "@/actions/multi-step/components";


export async function submitUserMessage(input: string) {
  'use server';

  const ui = await streamUI({
    model: openai('gpt-4o'),
    system: 'you are a flight booking assistant',
    prompt: input,
    temperature: 0,
    text: async ({content}) => <div>{content}</div>,
    tools: {
      searchFlights: {
        description: 'search for flights',
        parameters: z.object({
          origin: z.string().describe('The origin of the flight'),
          destination: z.string().describe('The destination of the flight'),
          date: z.string().describe('The date of the flight'),
        }),
        generate: async function* ({origin, destination, date}) {
          yield <LoadingSpinner message={`Searching for flights from ${origin} to ${destination} on ${date}...`}/>

          const results = await searchFlights(origin, destination, date);
          return <FlightSearchResults flights={results} />;
        },
      },
      lookupFlight: {
        description: 'lookup details for a selected flight by flight number',
        parameters: z.object({
          flightNumber: z.string().describe('The flight number'),
        }),
        generate: async function* ({flightNumber}) {
          yield <LoadingSpinner message={`Looking up flight details for ${flightNumber}...`}/>;

          const flightDetails = await lookupFlight(flightNumber);

          yield <LoadingSpinner message={`Gathering flight details for ${flightNumber}...`}/>;
          await delay(1000);

          return <FlightDetails flight={flightDetails} />
        },
      },

      selectedFlightConfirmation: {
        description: 'confirm selected flight and proceed to booking',
        parameters: z.object({
          flightNumber: z.string().describe('The flight number'),
        }),
        generate: async function* ({flightNumber}) {
          yield <LoadingSpinner message={`Confirming booking for ${flightNumber} and proceed to booking...`}/>;
          await delay(1000);
          return <CollectUserInfoForBooking flightNumber={flightNumber} />
        }
      },

      bookFlight: {
        description: 'book the flight',
        parameters: z.object({
          flightNumber: z.string().describe('The flight number'),
          passengerName:  z.string().describe('The passenger name'),
        }),
        generate: async function* ({flightNumber, passengerName}) {
          yield <LoadingSpinner message={`Booking flight ${flightNumber} for ${passengerName}...`}/>;
          const bookedFlight = await bookFlight(flightNumber, passengerName);

          yield <LoadingSpinner message={`Getting final confirmation from airline provider...`}/>;
          const bookedFlightConfirmation = await bookingConfirmation(bookedFlight.destination);

          yield <LoadingSpinner message={bookedFlightConfirmation}/>;
          await delay(1000);

          yield <LoadingSpinner message={'Creating your flight ticket...'}/>;
          await delay(1000);

          return <FlightTicket flight={bookedFlight} />
        }
      }
    },
  });

  return ui.value;
}
