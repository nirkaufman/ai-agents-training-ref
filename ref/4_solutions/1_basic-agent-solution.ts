'use server';

import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { AIMessage, BaseMessageLike, HumanMessage } from "@langchain/core/messages";
import { MemorySaver, MessagesAnnotation } from "@langchain/langgraph";
import { RunnableConfig } from "@langchain/core/runnables";

// Exercise 1: Basic Movie Agent
// Tool for getting movie information
const getMovieInfo = tool(
  async (input: { title: string }) => {
    // Mock movie database
    const movies: Record<string, {
      genre: string;
      rating: number;
      year: number;
      director: string;
      description: string;
    }> = {
      "The Matrix": {
        genre: "Action",
        rating: 4.5,
        year: 1999,
        director: "Lana Wachowski",
        description: "A computer hacker learns about the true nature of reality"
      },
      "Inception": {
        genre: "Sci-Fi",
        rating: 4.8,
        year: 2010,
        director: "Christopher Nolan",
        description: "A thief who steals corporate secrets through dream-sharing technology"
      }
    };

    const movie = movies[input.title];
    if (!movie) {
      return `Sorry, I don't have information about ${input.title}`;
    }

    return `Movie: ${input.title}
Genre: ${movie.genre}
Rating: ${movie.rating}/5
Year: ${movie.year}
Director: ${movie.director}
Description: ${movie.description}`;
  },
  {
    name: "getMovieInfo",
    description: "Get information about a movie",
    schema: z.object({
      title: z.string().describe("The title of the movie"),
    }),
  }
);

// Tool for getting movie recommendations
const getMovieRecommendations = tool(
  async (input: { genre: string }) => {
    const recommendations: Record<string, string[]> = {
      "Action": ["Die Hard", "Mad Max: Fury Road", "John Wick"],
      "Sci-Fi": ["Blade Runner", "Interstellar", "The Martian"],
      "Drama": ["The Godfather", "Shawshank Redemption", "Forrest Gump"]
    };

    const movies = recommendations[input.genre] || ["No recommendations found"];
    return `Recommended ${input.genre} movies:\n${movies.join("\n")}`;
  },
  {
    name: "getMovieRecommendations",
    description: "Get movie recommendations by genre",
    schema: z.object({
      genre: z.string().describe("The genre to get recommendations for"),
    }),
  }
);

// Tool for getting actor information
const getActorInfo = tool(
  async (input: { name: string }) => {
    const actors: Record<string, {
      movies: string[];
      awards: string[];
    }> = {
      "Keanu Reeves": {
        movies: ["The Matrix", "John Wick", "Speed"],
        awards: ["MTV Movie Award", "People's Choice Award"]
      },
      "Leonardo DiCaprio": {
        movies: ["Inception", "Titanic", "The Revenant"],
        awards: ["Academy Award", "Golden Globe"]
      }
    };

    const actor = actors[input.name];
    if (!actor) {
      return `Sorry, I don't have information about ${input.name}`;
    }

    return `Actor: ${input.name}
Notable Movies: ${actor.movies.join(", ")}
Awards: ${actor.awards.join(", ")}`;
  },
  {
    name: "getActorInfo",
    description: "Get information about an actor",
    schema: z.object({
      name: z.string().describe("The name of the actor"),
    }),
  }
);

// Set up the LLM
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});

// Exercise 1: Basic Movie Agent
const basicAgent = createReactAgent({
  llm,
  tools: [getMovieInfo],
  prompt: "You are a helpful movie assistant. Provide concise and accurate information about movies."
});

// Exercise 2: Dynamic Prompt Agent
const dynamicPrompt = (
  state: typeof MessagesAnnotation.State,
  config: RunnableConfig
): BaseMessageLike[] => {
  const userPreference = config.configurable?.preference;
  const systemMsg = `You are a movie expert. Focus on ${userPreference} aspects of movies. Provide detailed information and recommendations.`;
  return [{role: "system", content: systemMsg}, ...state.messages];
};

const dynamicAgent = createReactAgent({
  llm,
  tools: [getMovieInfo, getMovieRecommendations],
  prompt: dynamicPrompt
});

// Exercise 3: Memory-Enabled Agent
const checkpointer = new MemorySaver();

const memoryAgent = createReactAgent({
  llm,
  tools: [getMovieInfo, getMovieRecommendations, getActorInfo],
  prompt: dynamicPrompt,
  checkpointer
});

// Exercise 4: Advanced Features - Error handling and response formatting
export async function movieAgent(prompt: string) {
  try {
    const response = await basicAgent.invoke({
      messages: [{role: "user", content: prompt}]
    });

    return {
      messages: response.messages.map(msg => ({
        role: msg instanceof AIMessage ? 'assistant' : 'user',
        content: msg.content
      }))
    };
  } catch (error) {
    console.error('Error in movieAgent:', error);
    return {
      messages: [{
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.'
      }]
    };
  }
}

export async function movieAgent2(userId: string, prompt: string, preference: string) {
  try {
    const response = await dynamicAgent.invoke(
      {messages: [{role: "user", content: prompt}]},
      {configurable: {preference}}
    );

    return {
      messages: response.messages.map(msg => ({
        role: msg instanceof AIMessage ? 'assistant' : 'user',
        content: msg.content
      }))
    };
  } catch (error) {
    console.error('Error in movieAgent2:', error);
    return {
      messages: [{
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.'
      }]
    };
  }
}

export async function movieAgent3(userId: string, prompt: string, preference: string) {
  try {
    const response = await memoryAgent.invoke(
      {messages: [{role: "user", content: prompt}]},
      {configurable: {thread_id: userId, preference}}
    );

    return {
      messages: response.messages.map(msg => ({
        role: msg instanceof AIMessage ? 'assistant' : 'user',
        content: msg.content
      }))
    };
  } catch (error) {
    console.error('Error in movieAgent3:', error);
    return {
      messages: [{
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.'
      }]
    };
  }
}

// Example usage:
/*
// Basic agent
const response1 = await movieAgent("Tell me about The Matrix");

// Dynamic prompt agent
const response2 = await movieAgent2("user123", "Tell me about Inception", "action");

// Memory-enabled agent
const response3 = await movieAgent3("user123", "What other movies are similar?", "action");
*/ 