'use server';

import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createSwarm, createHandoffTool } from "@langchain/langgraph-swarm";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { MemorySaver } from "@langchain/langgraph/web";
import { ChatAnthropic } from "@langchain/anthropic";

// Tool implementations
const bookHotel = tool(
  async (input: { hotel_name: string }) => {
    return `\n Successfully booked a stay at ${input.hotel_name}. \n`;
  },
  {
    name: "book_hotel",
    description: "Book a hotel",
    schema: z.object({
      hotel_name: z.string().describe("The name of the hotel to book"),
    }),
  }
);

const bookFlight = tool(
  async (input: { from_airport: string; to_airport: string }) => {
    return `\n Successfully booked a flight from ${input.from_airport} to ${input.to_airport}. \n`;
  },
  {
    name: "book_flight",
    description: "Book a flight",
    schema: z.object({
      from_airport: z.string().describe("The departure airport code"),
      to_airport: z.string().describe("The arrival airport code"),
    }),
  }
);

// Handoff tool implementations
const transferToHotelAssistant = createHandoffTool({
  agentName: "hotel_assistant",
  description: "Transfer user to the hotel-booking assistant.",
});

const transferToFlightAssistant = createHandoffTool({
  agentName: "flight_assistant",
  description: "Transfer user to the flight-booking assistant.",
});

// Language model configuration
const llm = new ChatAnthropic({
  model: "claude-3-5-sonnet-latest",
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Agent configurations
const flightAssistant = createReactAgent({
  llm,
  tools: [bookFlight, transferToHotelAssistant],
  prompt: "You are a flight booking assistant. Your role is to help users book flights by gathering necessary information about departure and arrival airports. If the user also needs hotel booking, use the transferToHotelAssistant tool to hand off to the hotel booking assistant.",
  name: "flight_assistant",
  checkpointer: new MemorySaver()
});

const hotelAssistant = createReactAgent({
  llm,
  tools: [bookHotel, transferToFlightAssistant],
  prompt: "You are a hotel booking assistant. Your role is to help users book hotels by gathering necessary information about the hotel name. If the user also needs flight booking, use the transferToFlightAssistant tool to hand off to the flight booking assistant.",
  name: "hotel_assistant",
  checkpointer: new MemorySaver()
});

// Swarm creation and compilation
const swarm = createSwarm({
  agents: [flightAssistant, hotelAssistant],
  defaultActiveAgent: "flight_assistant",
}).compile();

// Stream handling implementation
export async function streamSwarmResponse(input: string) {
  const stream = await swarm.stream({
    messages: [{
      role: "user",
      content: input,
    }]
  }, {
    configurable: {
      thread_id: "2"
    },
  });

  return new ReadableStream({
    async start(controller) {
      try {
        // Track processed message IDs to prevent duplicates
        const processedMessageIds = new Set<string>();

        for await (const chunk of stream) {
          // Handle flight assistant messages
          if (chunk.flight_assistant?.messages) {
            const messages = chunk.flight_assistant.messages;
            for (const msg of messages) {
              // Skip if message was already processed
              if (processedMessageIds.has(msg.id)) {
                continue;
              }
              processedMessageIds.add(msg.id);

              // Skip ToolMessage content, keep everything else
              if (msg.type !== 'tool' && msg.content) {
                // Handle content that can be string or array
                if (Array.isArray(msg.content)) {
                  // Process each content block
                  for (const block of msg.content) {
                    // Only stream text content, skip tool_use blocks
                    if (block.type === 'text' && block.text) {
                      controller.enqueue(block.text + '\n');
                    }
                  }
                } else {
                  // Handle string content
                  controller.enqueue(msg.content + '\n');
                }
              }
            }
          }
          
          // Handle hotel assistant messages
          if (chunk.hotel_assistant?.messages) {
            const messages = chunk.hotel_assistant.messages;
            for (const msg of messages) {
              // Skip if message was already processed
              if (processedMessageIds.has(msg.id)) {
                continue;
              }
              processedMessageIds.add(msg.id);

              // Skip ToolMessage content, keep everything else
              if (msg.type !== 'tool' && msg.content) {
                // Handle content that can be string or array
                if (Array.isArray(msg.content)) {
                  // Process each content block
                  for (const block of msg.content) {
                    // Only stream text content, skip tool_use blocks
                    if (block.type === 'text' && block.text) {
                      controller.enqueue(block.text + '\n');
                    }
                  }
                } else {
                  // Handle string content
                  controller.enqueue(msg.content + '\n');
                }
              }
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