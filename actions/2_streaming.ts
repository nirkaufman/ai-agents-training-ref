'use server';

import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Weather tool definition
const getWeather = tool(
  async (input: { city: string }) => {
    return `It's always sunny in ${input.city}!`;
  },
  {
    name: "getWeather",
    description: "Get weather for a given city.",
    schema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
  }
);

// Set up the LLM
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

// Create the agent
const agent = createReactAgent({
  llm,
  tools: [getWeather],
  prompt: "You are a helpful assistant. use sarcastic tone."
});

// Streaming server action
export async function streamAgentResponse(prompt: string) {

  // Initialize the agent streaming process
  const agentStream = await agent.stream(
    { messages: [{ role: "user", content: prompt }] },
    { streamMode: "updates" }
  );

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of agentStream) {
        console.log("Agent chunk:", chunk);

        // Handle different types of chunks that can come from the agent
        if (chunk.agent && chunk.agent.messages && chunk.agent.messages.length > 0) {
          // Final answer from the agent
          if (chunk.agent.messages[0].content) {
            controller.enqueue(chunk.agent.messages[0].content);
          }
        }
        else if (chunk.tools && chunk.tools.messages && chunk.tools.messages.length > 0) {
          // Tool response
          if (chunk.tools.messages[0].content) {
            controller.enqueue(`Tool Result: ${chunk.tools.messages[0].content}`);
          }
        }
        else if (chunk.intermediate_steps) {
          // Intermediate steps (reasoning, etc.)
          for (const step of chunk.intermediate_steps) {
            if (step.action) {
              // Tool being called
              controller.enqueue(`Using tool: ${step.action.tool} with input: ${step.action.toolInput}`);
            }
            if (step.observation) {
              // Tool response
              controller.enqueue(`Tool result: ${step.observation}`);
            }
          }
        }
        else if (chunk.generated) {
          // Generated reasoning
          controller.enqueue(`Thinking: ${chunk.generated}`);
        }
      }
      controller.close();
    },
  });


}
