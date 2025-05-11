'use server'

import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { Command, interrupt } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { ToolMessage } from "@langchain/core/messages";

// An example of a sensitive tool that requires human review / approval
const bookHotel = tool(
  async (input: { hotelName: string; }) => {
    let hotelName = input.hotelName;

    // Request human approval
    const response = await interrupt(
      `Trying to call \`book_hotel\` with args {'hotel_name': ${hotelName}}. ` +
      `Please approve or suggest edits.`
    );

    // Handle the response
    if (response.type === "approve") {
      return `Successfully booked a stay at ${hotelName}.`;
    } else if (response.type === "edit") {
      hotelName = response.args["hotel_name"];
      return `Successfully booked a stay at ${hotelName}.`;
    } else {
      throw new Error(`Unknown response type: ${response.type}`);
    }
  },
  {
    name: "bookHotel",
    schema: z.object({
      hotelName: z.string().describe("Hotel to book"),
    }),
    description: "Book a hotel.",
  }
);

const checkpointer = new MemorySaver();

// Set up the LLM
const llm = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
});

const agent = createReactAgent({
  llm,
  tools: [bookHotel],
  checkpointer
});

export async function streamWithHumanInTheLoop(input: string) {
  const config = {
    configurable: {
      thread_id: "1"
    }
  };

  const agentStream = await agent.stream(
    {
      messages: [
        {
          role: "user",
          content: input
        },
        {
          role: "system",
          content: "You are a helpful assistant that can help me book a hotel. Your name is Joe."
        }
      ]
    },
    config
  );

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of agentStream) {
          console.log('chunk', chunk);

          // Handle interrupt messages
          if (chunk.__interrupt__) {
            controller.enqueue(chunk.__interrupt__[0].value);
            // Send default approve command
            await agent.stream(
              new Command({ resume: { type: "approve" } }),
              config
            );
            continue;
          }

          // Handle agent messages
          if (chunk.agent?.messages?.[0]?.content) {
            controller.enqueue(chunk.agent.messages[0].content);
          }

          // Handle tool messages
          if (chunk.tools?.messages) {
            for (const msg of chunk.tools.messages) {
              controller.enqueue(msg.content);
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

// Function to resume the agent with a command
export async function resumeWithCommand(command: { type: "accept" } | { type: "edit", args: { hotel_name: string } }) {
  const config = {
    configurable: {
      thread_id: "1"
    }
  };

  const agentStream = await agent.stream(
    new Command({ resume: command }),
    config
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
            for (const msg of chunk.tools.messages) {
              controller.enqueue(msg.content);
            }
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  });
}
