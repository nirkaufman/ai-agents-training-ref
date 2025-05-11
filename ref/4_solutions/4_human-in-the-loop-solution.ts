'use server'

import { MemorySaver } from "@langchain/langgraph-checkpoint";
import { Command, interrupt } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { ToolMessage } from "@langchain/core/messages";

// Helper functions for validation
const isValidDate = (date: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;
  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
};

const isValidAirport = (code: string): boolean => {
  return /^[A-Z]{3}$/.test(code);
};

const isValidCurrency = (currency: string): boolean => {
  return /^[A-Z]{3}$/.test(currency);
};

// Hotel Booking Tool
const bookHotel = tool(
  async (input: { hotelName: string; dates: string; roomType: string; }) => {
    const { hotelName, dates, roomType } = input;

    // Validate inputs
    if (!hotelName || !dates || !roomType) {
      throw new Error("Missing required fields");
    }
    if (!isValidDate(dates)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    // Request human approval
    const response = await interrupt(
      `Trying to book hotel with args: {
        'hotel_name': ${hotelName},
        'dates': ${dates},
        'room_type': ${roomType}
      }. Please approve or suggest edits.`
    );

    // Handle the response
    if (response.type === "approve") {
      return `Successfully booked a ${roomType} room at ${hotelName} for ${dates}.`;
    } else if (response.type === "edit") {
      const editedHotelName = response.args["hotel_name"] || hotelName;
      const editedDates = response.args["dates"] || dates;
      const editedRoomType = response.args["room_type"] || roomType;
      return `Successfully booked a ${editedRoomType} room at ${editedHotelName} for ${editedDates}.`;
    } else {
      throw new Error(`Unknown response type: ${response.type}`);
    }
  },
  {
    name: "bookHotel",
    schema: z.object({
      hotelName: z.string().describe("Name of the hotel to book"),
      dates: z.string().describe("Check-in date in YYYY-MM-DD format"),
      roomType: z.string().describe("Type of room to book"),
    }),
    description: "Book a hotel room with human approval.",
  }
);

// Flight Booking Tool
const bookFlight = tool(
  async (input: { origin: string; destination: string; dates: string; }) => {
    const { origin, destination, dates } = input;

    // Validate inputs
    if (!origin || !destination || !dates) {
      throw new Error("Missing required fields");
    }
    if (!isValidAirport(origin) || !isValidAirport(destination)) {
      throw new Error("Invalid airport code. Use 3-letter IATA code");
    }
    if (!isValidDate(dates)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }

    // Request human approval
    const response = await interrupt(
      `Trying to book flight with args: {
        'origin': ${origin},
        'destination': ${destination},
        'dates': ${dates}
      }. Please approve or suggest edits.`
    );

    // Handle the response
    if (response.type === "approve") {
      return `Successfully booked flight from ${origin} to ${destination} for ${dates}.`;
    } else if (response.type === "edit") {
      const editedOrigin = response.args["origin"] || origin;
      const editedDestination = response.args["destination"] || destination;
      const editedDates = response.args["dates"] || dates;
      return `Successfully booked flight from ${editedOrigin} to ${editedDestination} for ${editedDates}.`;
    } else {
      throw new Error(`Unknown response type: ${response.type}`);
    }
  },
  {
    name: "bookFlight",
    schema: z.object({
      origin: z.string().describe("Origin airport code (IATA)"),
      destination: z.string().describe("Destination airport code (IATA)"),
      dates: z.string().describe("Flight date in YYYY-MM-DD format"),
    }),
    description: "Book a flight with human approval.",
  }
);

// Payment Processing Tool
const processPayment = tool(
  async (input: { amount: number; currency: string; paymentMethod: string; }) => {
    const { amount, currency, paymentMethod } = input;

    // Validate inputs
    if (!amount || !currency || !paymentMethod) {
      throw new Error("Missing required fields");
    }
    if (amount <= 0) {
      throw new Error("Amount must be greater than 0");
    }
    if (!isValidCurrency(currency)) {
      throw new Error("Invalid currency code. Use 3-letter ISO code");
    }

    // Request human approval
    const response = await interrupt(
      `Trying to process payment with args: {
        'amount': ${amount},
        'currency': ${currency},
        'payment_method': ${paymentMethod}
      }. Please approve or suggest edits.`
    );

    // Handle the response
    if (response.type === "approve") {
      return `Successfully processed payment of ${amount} ${currency} using ${paymentMethod}.`;
    } else if (response.type === "edit") {
      const editedAmount = response.args["amount"] || amount;
      const editedCurrency = response.args["currency"] || currency;
      const editedPaymentMethod = response.args["payment_method"] || paymentMethod;
      return `Successfully processed payment of ${editedAmount} ${editedCurrency} using ${editedPaymentMethod}.`;
    } else {
      throw new Error(`Unknown response type: ${response.type}`);
    }
  },
  {
    name: "processPayment",
    schema: z.object({
      amount: z.number().describe("Payment amount"),
      currency: z.string().describe("Currency code (ISO)"),
      paymentMethod: z.string().describe("Payment method"),
    }),
    description: "Process a payment with human approval.",
  }
);

// Set up the agent
const checkpointer = new MemorySaver();

const llm = new ChatOpenAI({
  model: "gpt-4o",
  temperature: 0,
});

const agent = createReactAgent({
  llm,
  tools: [bookHotel, bookFlight, processPayment],
  checkpointer
});

// Stream handler implementation
export async function streamBookingAgentResponse(input: string) {
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
          content: "You are a helpful travel booking assistant. Your name is Joe. You can help with hotel bookings, flight reservations, and payment processing. All sensitive operations require human approval."
        }
      ]
    },
    config
  );

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of agentStream) {
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
export async function resumeWithCommand(command: { type: "approve" } | { type: "edit", args: { [key: string]: any } }) {
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
        console.error('Streaming error:', error);
        controller.error(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  });
} 