'use server'

import {z} from "zod";
import {ChatOpenAI} from "@langchain/openai";

import {tool} from "@langchain/core/tools";
import {createReactAgent} from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph/web";


// Tools are just function.
// start by implementing few of them as follows:


type WeatherForecastArgs = {
  destination: string,
  month: string
}

const weatherForecast = tool(
    async ({destination, month}: WeatherForecastArgs) => {
      return `Weather forecast for ${destination} in ${month}: Sunny and warm!`
    },
    {
      name: "weather-forecast",
      description: "provides a weather forecast for a destination in a month",
      schema: z.object({
        destination: z.string().describe("destination to get weather forecast for, e.g. London, UK"),
        month: z.string().describe("month to get weather forecast for, e.g. January, February, March, etc.")
      })
    }
)


type FlightLocatorArgs = {
  destination: string
  date: string,
  origin: string,
}

const flightLocator = tool(
    async ({destination, date, origin}: FlightLocatorArgs) => {
      return `Flight locator from ${origin} to ${destination} in ${date}: ELAL #657, departure at 10:00 AM, arrival at 11:00 AM`;
    },
    {
      name: "flight-locator",
      description: "provides a flight locator for a given origin and destination in a month",
      schema: z.object({
        origin: z.string().describe("origin city to get flight locator for, e.g. London, UK"),
        destination: z.string().describe("destination city to get flight locator for, e.g. New York, USA"),
        date: z.string().describe("date to get flight locator for, e.g. January 12th, February 1st, March 4, etc.")
      })
    }
)


type AirportTaxiBookingArgs = {
  origin: string,
  departure: string,
}


const airportTaxiBooking = tool(
    async ({origin, departure}: AirportTaxiBookingArgs) => {
      return `Taxi booking to ${origin} airport at ${departure}`;
    },
    {
      name: "airport-taxi-booking",
      description: "provides a taxi booking for a given origin, to get on time for your flight departure",
      schema: z.object({
        origin: z.string().describe("origin city to get taxi booking for, e.g. Tel-Aviv, Israel"),
        departure: z.string().describe("departure time to get taxi booking for, e.g. 10:00 AM, 11:00 AM, 12:00 PM, etc."),
      })
    }
)


type HotelBookingArgs = {
  arrivalDate: string,
}

const hotelBooking = tool(
    async ({arrivalDate}: HotelBookingArgs) => {
      return `Hotel booking for ${arrivalDate}`;
    },
    {
      name: "hotel-booking",
      description: "provides a hotel booking for a given arrival date",
      schema: z.object({
        arrivalDate: z.string().describe("arrival date to get hotel booking for, e.g. January 12th, February 1st, March 4, etc."),
      })
    }
)


type AttractionRecommendationArgs = {
  destination: string,
}

const attractionRecommendation = tool(
    async ({destination}: AttractionRecommendationArgs) => {
      return `Attraction recommendation in ${destination}`;
    },
    {
      name: "attraction-recommendation",
      description: "provides an attraction recommendation",
      schema: z.object({
        destination: z.string().describe("destination to get attraction recommendations for")
      })
    }
)


// Set up the LLM -
const llm = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
});

const checkpointer = new MemorySaver();


const agent = createReactAgent({
  llm,
  checkpointer,
  tools: [
    weatherForecast,
    flightLocator,
    airportTaxiBooking,
    hotelBooking,
    attractionRecommendation
  ],
});

interface ToolMessage {
  content: string;
  name: string;
  tool_call_id: string;
}

// Server action function that streams responses
export async function streamBookingAgentResponse(input: string) {
  const agentStream = await agent.stream(
    { messages: [{
      role: "user", content: input },
      {
        role: "system",
        content: "You are a helpful assistant that can help me book a flight, hotel, and attraction. your name is Joe"
      }
    ] },
    {
      configurable: {
        thread_id: 1,       
      }
    }
  );

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of agentStream) {
          // Handle agent messages
          if (chunk.agent?.messages?.[0]?.content) {
            controller.enqueue(chunk.agent.messages[0].content);
          }
          
          // Handle tool messages
          if (chunk.tools?.messages) {
            chunk.tools.messages.forEach((msg: ToolMessage) => {
              controller.enqueue(msg.content);
            });
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });
}
