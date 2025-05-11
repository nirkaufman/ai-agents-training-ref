'use server';

import { ChatOpenAI } from "@langchain/openai";
import { createSupervisor } from "@langchain/langgraph-supervisor";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import {MemorySaver} from "@langchain/langgraph/web";


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

const llm = new ChatOpenAI({ model: "gpt-4o" });

// Create specialized agents
const flightAssistant = createReactAgent({
  llm,
  tools: [bookFlight],
  prompt: "You are a flight booking assistant",
  name: "flight_assistant",
  checkpointer: new MemorySaver()
});

const hotelAssistant = createReactAgent({
  llm,
  tools: [bookHotel],
  prompt: "You are a hotel booking assistant",
  name: "hotel_assistant",
  checkpointer: new MemorySaver()
});



const supervisor = createSupervisor({
  agents: [flightAssistant, hotelAssistant],
  llm,
  prompt: "You manage a hotel booking assistant and a flight booking assistant. Assign work to them, one at a time.",
}).compile();


export async function streamSupervisorResponse(input: string) {
  const stream = await supervisor.stream({
    messages: [{
      role: "user",
      content: input,
    }, {
      role: "system",
      content: "You are a helpful assistant that can help me book a hotel and a flight. Your name is Joe."
    }],
  }, {
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
            // Get the last message from the supervisor (most recent response)
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
