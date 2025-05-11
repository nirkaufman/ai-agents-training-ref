'use server';

import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { LangGraphRunnableConfig } from "@langchain/langgraph";

// Types for messages
interface ToolMessage {
  content: string;
  name: string;
  tool_call_id: string;
}

// Tool implementations
const weatherTool = tool(
  async (input: { city: string }, config: LangGraphRunnableConfig) => {
    config.writer?.(`Fetching weather for ${input.city}...`);
    return `The weather in ${input.city} is sunny and 72°F!`;
  },
  {
    name: "getWeather",
    description: "Get weather for a given city.",
    schema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
  }
);

const calculatorTool = tool(
  async (input: { expression: string }, config: LangGraphRunnableConfig) => {
    config.writer?.(`Calculating ${input.expression}...`);
    try {
      // Note: In a real application, use a proper expression parser
      const result = eval(input.expression);
      return `The result of ${input.expression} is ${result}`;
    } catch (error) {
      return `Error calculating ${input.expression}`;
    }
  },
  {
    name: "calculator",
    description: "Perform basic math calculations.",
    schema: z.object({
      expression: z.string().describe("The mathematical expression to calculate"),
    }),
  }
);

const jokeTool = tool(
  async (input: { topic: string }, config: LangGraphRunnableConfig) => {
    config.writer?.(`Thinking of a joke about ${input.topic}...`);
    return `Why did the ${input.topic} go to the doctor? Because it wasn't feeling well!`;
  },
  {
    name: "tellJoke",
    description: "Tell a joke about a given topic.",
    schema: z.object({
      topic: z.string().describe("The topic for the joke"),
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
  tools: [weatherTool, calculatorTool, jokeTool],
  prompt: "You are a helpful assistant that can tell jokes, do math, and check the weather. Use a friendly tone."
});

// Streaming server action
export async function streamAgentResponse(prompt: string) {
  const agentStream = await agent.stream(
    { messages: [{ role: "user", content: prompt }] },
    { 
      streamMode: ["updates", "messages"],
      configurable: {
        thread_id: Date.now(), // Unique thread ID for each request
      }
    }
  );

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of agentStream) {
          // Handle agent messages
          if (chunk.agent?.messages?.[0]?.content) {
            controller.enqueue({
              type: 'agent',
              content: chunk.agent.messages[0].content
            });
          }
          
          // Handle tool responses
          if (chunk.tools?.messages) {
            chunk.tools.messages.forEach((msg: ToolMessage) => {
              controller.enqueue({
                type: 'tool',
                name: msg.name,
                content: msg.content
              });
            });
          }
          
          // Handle intermediate steps
          if (chunk.intermediate_steps) {
            for (const step of chunk.intermediate_steps) {
              if (step.action) {
                controller.enqueue({
                  type: 'action',
                  tool: step.action.tool,
                  input: step.action.toolInput
                });
              }
              if (step.observation) {
                controller.enqueue({
                  type: 'observation',
                  content: step.observation
                });
              }
            }
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });
}

// Client component (for reference)
/*
'use client';

import { useState } from 'react';

interface StreamMessage {
  type: 'agent' | 'tool' | 'action' | 'observation';
  content: string;
  name?: string;
  tool?: string;
  input?: any;
}

export default function StreamingChat() {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const stream = await streamAgentResponse(prompt);
      const reader = stream.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        setMessages(prev => [...prev, value]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {messages.map((msg, index) => (
        <div key={index} className={`message ${msg.type}`}>
          {msg.content}
        </div>
      ))}
      {isLoading && <div className="loading">Thinking...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}
*/ 