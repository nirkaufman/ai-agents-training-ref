import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph/web";
import { LangGraphRunnableConfig } from "@langchain/langgraph";

// Helper functions for validation
function isValidMonth(month: string): boolean {
  const months = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];
  return months.includes(month.toLowerCase());
}

function isValidAirport(code: string): boolean {
  return /^[A-Z]{3}$/.test(code);
}

function isValidDate(date: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

// Weather Tool with progress updates and error handling
const weatherTool = tool(
  async (input: { destination: string; month: string }, config: LangGraphRunnableConfig) => {
    try {
      // Input validation
      if (!input.destination) {
        return "Error: Destination is required";
      }
      if (!isValidMonth(input.month)) {
        return `Error: Invalid month. Please use a valid month name (e.g., January, February, etc.)`;
      }

      // Progress updates
      config.writer?.("Fetching weather data...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      config.writer?.("Processing weather information...");
      await new Promise(resolve => setTimeout(resolve, 500));

      return `Weather forecast for ${input.destination} in ${input.month}: Sunny and warm with temperatures around 72°F (22°C). Perfect for outdoor activities!`;
    } catch (error) {
      return `Error fetching weather: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
  {
    name: "weather-forecast",
    description: "Get weather forecast for a destination in a specific month",
    schema: z.object({
      destination: z.string().describe("Destination to get weather forecast for (e.g., London, UK)"),
      month: z.string().describe("Month to get weather forecast for (e.g., January, February, etc.)")
    })
  }
);

// Flight Tool with validation and progress updates
const flightTool = tool(
  async (input: { origin: string; destination: string; date: string }, config: LangGraphRunnableConfig) => {
    try {
      // Input validation
      if (!isValidAirport(input.origin)) {
        return `Error: Invalid origin airport code. Please use a valid IATA code (e.g., JFK, LHR)`;
      }
      if (!isValidAirport(input.destination)) {
        return `Error: Invalid destination airport code. Please use a valid IATA code (e.g., JFK, LHR)`;
      }
      if (!isValidDate(input.date)) {
        return `Error: Invalid date format. Please use YYYY-MM-DD format`;
      }

      // Progress updates
      config.writer?.("Searching for available flights...");
      await new Promise(resolve => setTimeout(resolve, 1500));
      config.writer?.("Checking seat availability...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      return `Found flights from ${input.origin} to ${input.destination} on ${input.date}:
        - Flight 1: ELAL #657, Departure 10:00 AM, Arrival 11:00 AM, Price: $500
        - Flight 2: Delta #123, Departure 2:00 PM, Arrival 3:00 PM, Price: $600
        - Flight 3: United #789, Departure 6:00 PM, Arrival 7:00 PM, Price: $450`;
    } catch (error) {
      return `Error searching flights: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
  {
    name: "flight-locator",
    description: "Find available flights between two airports on a specific date",
    schema: z.object({
      origin: z.string().describe("Origin airport code (e.g., JFK, LHR)"),
      destination: z.string().describe("Destination airport code (e.g., JFK, LHR)"),
      date: z.string().describe("Travel date in YYYY-MM-DD format")
    })
  }
);

// Hotel Tool with date validation and progress updates
const hotelTool = tool(
  async (input: { arrivalDate: string }, config: LangGraphRunnableConfig) => {
    try {
      // Input validation
      if (!isValidDate(input.arrivalDate)) {
        return `Error: Invalid date format. Please use YYYY-MM-DD format`;
      }

      // Progress updates
      config.writer?.("Searching for available hotels...");
      await new Promise(resolve => setTimeout(resolve, 1200));
      config.writer?.("Checking room availability...");
      await new Promise(resolve => setTimeout(resolve, 800));

      return `Available hotels for arrival on ${input.arrivalDate}:
        - Hotel 1: Grand Hotel, $200/night, 4.5 stars, Pool & Spa
        - Hotel 2: City Center Hotel, $150/night, 4.0 stars, Gym & Restaurant
        - Hotel 3: Beach Resort, $300/night, 4.8 stars, Beach Access`;
    } catch (error) {
      return `Error searching hotels: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
  {
    name: "hotel-booking",
    description: "Find available hotels for a specific arrival date",
    schema: z.object({
      arrivalDate: z.string().describe("Arrival date in YYYY-MM-DD format")
    })
  }
);

// Attraction Tool with location validation and progress updates
const attractionTool = tool(
  async (input: { destination: string }, config: LangGraphRunnableConfig) => {
    try {
      // Input validation
      if (!input.destination) {
        return "Error: Destination is required";
      }

      // Progress updates
      config.writer?.("Searching for attractions...");
      await new Promise(resolve => setTimeout(resolve, 1000));
      config.writer?.("Getting attraction details...");
      await new Promise(resolve => setTimeout(resolve, 500));

      return `Popular attractions in ${input.destination}:
        - Museum of Modern Art: World-class art collection, open 10 AM - 6 PM
        - Central Park: Beautiful urban park, perfect for outdoor activities
        - Empire State Building: Iconic skyscraper with observation deck
        - Times Square: Famous entertainment and shopping district`;
    } catch (error) {
      return `Error finding attractions: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
  {
    name: "attraction-recommendation",
    description: "Get recommendations for popular attractions in a destination",
    schema: z.object({
      destination: z.string().describe("Destination to get attraction recommendations for")
    })
  }
);

// Set up the agent with all tools
const llm = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
});

const checkpointer = new MemorySaver();

const agent = createReactAgent({
  llm,
  checkpointer,
  tools: [
    weatherTool,
    flightTool,
    hotelTool,
    attractionTool
  ],
});

// Server action for streaming responses
export async function streamTravelAgentResponse(input: string) {
  const agentStream = await agent.stream(
    {
      messages: [
        { role: "user", content: input },
        {
          role: "system",
          content: "You are a helpful travel assistant that can help users plan their trips. You can check weather, find flights, book hotels, and recommend attractions."
        }
      ]
    },
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
            chunk.tools.messages.forEach((msg: { content: string; name: string; tool_call_id: string }) => {
              controller.enqueue(msg.content);
            });
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  });
} 