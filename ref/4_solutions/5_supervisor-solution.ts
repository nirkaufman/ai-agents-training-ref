'use server';

import { ChatOpenAI } from "@langchain/openai";
import { createSupervisor } from "@langchain/langgraph-supervisor";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph/web";

// Helper functions for validation
const isValidAirport = (code: string): boolean => {
  return /^[A-Z]{3}$/.test(code);
};

const isValidDate = (date: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

// Flight Booking Tool
const bookFlight = tool(
  async (input: { from_airport: string; to_airport: string; date: string }) => {
    try {
      // Validate inputs
      if (!isValidAirport(input.from_airport)) {
        throw new Error(`Invalid departure airport code: ${input.from_airport}`);
      }
      if (!isValidAirport(input.to_airport)) {
        throw new Error(`Invalid arrival airport code: ${input.to_airport}`);
      }
      if (!isValidDate(input.date)) {
        throw new Error(`Invalid date format: ${input.date}`);
      }

      // Simulate flight booking
      return `\nSuccessfully booked a flight from ${input.from_airport} to ${input.to_airport} on ${input.date}.\n`;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Flight booking failed: ${error.message}`);
      }
      throw new Error('Flight booking failed: Unknown error');
    }
  },
  {
    name: "book_flight",
    description: "Book a flight between two airports on a specific date",
    schema: z.object({
      from_airport: z.string().describe("The departure airport code (e.g., JFK)"),
      to_airport: z.string().describe("The arrival airport code (e.g., LAX)"),
      date: z.string().describe("The flight date in YYYY-MM-DD format"),
    }),
  }
);

// Hotel Booking Tool
const bookHotel = tool(
  async (input: { hotel_name: string; check_in: string; check_out: string }) => {
    try {
      // Validate inputs
      if (!isValidDate(input.check_in)) {
        throw new Error(`Invalid check-in date: ${input.check_in}`);
      }
      if (!isValidDate(input.check_out)) {
        throw new Error(`Invalid check-out date: ${input.check_out}`);
      }

      // Simulate hotel booking
      return `\nSuccessfully booked a stay at ${input.hotel_name} from ${input.check_in} to ${input.check_out}.\n`;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Hotel booking failed: ${error.message}`);
      }
      throw new Error('Hotel booking failed: Unknown error');
    }
  },
  {
    name: "book_hotel",
    description: "Book a hotel stay",
    schema: z.object({
      hotel_name: z.string().describe("The name of the hotel to book"),
      check_in: z.string().describe("Check-in date in YYYY-MM-DD format"),
      check_out: z.string().describe("Check-out date in YYYY-MM-DD format"),
    }),
  }
);

// Attraction Booking Tool
const bookAttraction = tool(
  async (input: { attraction_name: string; date: string; time: string }) => {
    try {
      // Validate inputs
      if (!isValidDate(input.date)) {
        throw new Error(`Invalid date: ${input.date}`);
      }
      if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(input.time)) {
        throw new Error(`Invalid time format: ${input.time}`);
      }

      // Simulate attraction booking
      return `\nSuccessfully booked ${input.attraction_name} for ${input.date} at ${input.time}.\n`;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Attraction booking failed: ${error.message}`);
      }
      throw new Error('Attraction booking failed: Unknown error');
    }
  },
  {
    name: "book_attraction",
    description: "Book a tourist attraction",
    schema: z.object({
      attraction_name: z.string().describe("The name of the attraction to book"),
      date: z.string().describe("The date in YYYY-MM-DD format"),
      time: z.string().describe("The time in HH:MM format"),
    }),
  }
);

// Configure the language model
const llm = new ChatOpenAI({ model: "gpt-4o" });

// Create specialized agents
const flightAssistant = createReactAgent({
  llm,
  tools: [bookFlight],
  prompt: "You are a flight booking assistant. Help users book flights between airports.",
  name: "flight_assistant",
  checkpointer: new MemorySaver()
});

const hotelAssistant = createReactAgent({
  llm,
  tools: [bookHotel],
  prompt: "You are a hotel booking assistant. Help users book hotel stays.",
  name: "hotel_assistant",
  checkpointer: new MemorySaver()
});

const attractionAssistant = createReactAgent({
  llm,
  tools: [bookAttraction],
  prompt: "You are a tourist attraction booking assistant. Help users book visits to attractions.",
  name: "attraction_assistant",
  checkpointer: new MemorySaver()
});

// Create the supervisor
const supervisor = createSupervisor({
  agents: [flightAssistant, hotelAssistant, attractionAssistant],
  llm,
  prompt: "You manage a team of travel assistants. Coordinate between flight booking, hotel booking, and attraction booking assistants. Assign tasks to the appropriate assistant based on the user's request.",
}).compile();

// Stream handler implementation
export async function streamSupervisorResponse(input: string) {
  const stream = await supervisor.stream({
    messages: [{
      role: "user",
      content: input,
    }, {
      role: "system",
      content: "You are a helpful travel assistant that can help users book flights, hotels, and attractions. Your name is TravelBot."
    }],
    configurable: {
      thread_id: "1"
    }
  });

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          // Handle supervisor messages
          if (chunk.supervisor?.messages) {
            const lastMessage = chunk.supervisor.messages[chunk.supervisor.messages.length - 1];
            if (lastMessage?.content) {
              controller.enqueue(lastMessage.content + '\n');
            }
          }

          // Handle tool messages
          if (chunk.tools?.messages) {
            for (const msg of chunk.tools.messages) {
              controller.enqueue(msg.content + '\n');
            }
          }
        }
        controller.close();
      } catch (error) {
        console.error('Streaming error:', error);
        controller.error(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  });
} 