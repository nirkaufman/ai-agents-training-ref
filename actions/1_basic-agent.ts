'use server';

import {createReactAgent} from "@langchain/langgraph/prebuilt";
import {ChatOpenAI} from "@langchain/openai";
import {tool} from "@langchain/core/tools";
import {z} from "zod";
import {AIMessage, BaseMessageLike, HumanMessage} from "@langchain/core/messages";
import {MemorySaver, MessagesAnnotation} from "@langchain/langgraph";
import {RunnableConfig} from "@langchain/core/runnables";

//  A tool is just a function that takes in input and returns output.
// It consists of a name, a schema, and a description.
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

// Instantiate LLM model of your choice
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
})


// An example of an agent with a hardcoded static system prompt
const agent = createReactAgent({
  llm,
  tools: [getWeather],
  prompt: "You are a helpful assistant. use sarcastic tone."
});


// Run the agent
export async function weatherAgent(prompt: string) {

  const response = await agent.invoke({
    messages: [
      {role: "user", content: prompt}
    ]
  });

  // Serialize the messages before sending to client
  return {
    messages: response.messages.map(msg => ({
      role: msg instanceof AIMessage ? 'assistant' : 'user',
      content: msg.content
    }))
  };
}




/*******************

Dynamic System Prompt

*********************/


// Example of a custom prompt function that defines a system prompt
// In runtime.
const prompt = (
    state: typeof MessagesAnnotation.State, config: RunnableConfig
): BaseMessageLike[] => {
  const userName = config.configurable?.userName;
  const systemMsg = `You are a helpful assistant. Address the user as ${userName}.`;

  return [{role: "system", content: systemMsg}, ...state.messages];
};


// An example of an agent with a dynamic system prompt
const agent2 = createReactAgent({
  llm,
  tools: [getWeather],
  prompt
});


// Run the agent
export async function weatherAgent2(userName: string, prompt: string) {

  const response = await agent2.invoke(
      {messages: [{role: "user", content: prompt}]},
      {configurable: {userName}}
  );

  // Serialize the messages before sending to client
  return {
    messages: response.messages.map(msg => ({
      role: msg instanceof AIMessage ? 'assistant' : 'user',
      content: msg.content
    }))
  };
}


/*******************

 Adding memory

*********************/

const checkpointer = new MemorySaver();

const agent3 = createReactAgent({
  llm,
  tools: [getWeather],
  prompt,
  checkpointer,
});


// Run the agent
export async function weatherAgent3(userName: string, prompt: string) {

  const response = await agent3.invoke(
      {messages: [{role: "user", content: prompt}]},
      {configurable: {thread_id: 1, userName}}
  );

  // Serialize the messages before sending to client
  return {
    messages: response.messages.map(msg => ({
      role: msg instanceof AIMessage ? 'assistant' : 'user',
      content: msg.content
    }))
  };
}


// Example of how to set a recursion limit
const maxIterations = 3;
const recursionLimit = 2 * maxIterations + 1;

const agent4 = createReactAgent({
  llm,
  tools: [getWeather]
});

const agentWithRecursionLimit = agent.withConfig({ recursionLimit });


// Example of how to set a response format
const WeatherResponse = z.object({
  conditions: z.string()
});

const agent5 = createReactAgent({
  llm,
  tools: [getWeather],
  responseFormat: WeatherResponse  
});