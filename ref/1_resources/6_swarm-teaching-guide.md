# Teaching Guide: Multi-Agent Swarm Architecture

## Learning Objectives

By the end of this lesson, students should be able to:
1. Understand the concept of swarm architecture in AI systems
2. Implement specialized agents with specific roles
3. Create and manage agent handoffs
4. Handle streaming responses from multiple agents
5. Implement proper message handling and deduplication

## Key Concepts

### 1. Swarm Architecture
- **Definition**: A system where multiple specialized agents work together to solve complex tasks
- **Benefits**:
  - Task specialization
  - Parallel processing
  - Improved problem-solving capabilities
  - Better user experience through focused interactions

### 2. Agent Specialization
- **Purpose**: Each agent focuses on a specific domain or task
- **Example**: 
  - Flight booking agent
  - Hotel booking agent
- **Benefits**:
  - More accurate responses
  - Better context understanding
  - Improved user experience

### 3. Agent Handoff
- **Definition**: Process of transferring control between agents
- **Implementation**: Using `createHandoffTool`
- **Use Cases**:
  - When task requires different expertise
  - When user request spans multiple domains
  - When one agent needs assistance from another

### 4. Message Streaming
- **Purpose**: Real-time delivery of agent responses
- **Components**:
  - ReadableStream
  - Message chunks
  - Content type handling
- **Benefits**:
  - Immediate feedback
  - Better user engagement
  - Progressive response delivery

## Technical Components

### 1. Core Dependencies
```typescript
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createSwarm, createHandoffTool } from "@langchain/langgraph-swarm";
import { tool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph/web";
```

### 2. Tool Creation
- **Purpose**: Define agent capabilities
- **Components**:
  - Function implementation
  - Schema definition
  - Name and description
- **Example**:
```typescript
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
```

### 3. Agent Configuration
- **Components**:
  - Language model
  - Tools
  - Prompt
  - Name
  - Memory management
- **Example**:
```typescript
const flightAssistant = createReactAgent({
  llm,
  tools: [bookFlight, transferToHotelAssistant],
  prompt: "You are a flight booking assistant",
  name: "flight_assistant",
  checkpointer: new MemorySaver()
});
```

### 4. Swarm Creation
- **Components**:
  - Agent list
  - Default active agent
  - Compilation
- **Example**:
```typescript
const swarm = createSwarm({
  agents: [flightAssistant, hotelAssistant],
  defaultActiveAgent: "flight_assistant",
}).compile();
```

## Message Handling

### 1. Message Types
- **AIMessage**: Responses from agents
- **ToolMessage**: Tool execution results
- **HumanMessage**: User inputs
- **SystemMessage**: System-level communications

### 2. Content Types
- **String Content**: Simple text messages
- **Array Content**: Complex messages with multiple blocks
- **Tool Use Blocks**: Tool execution instructions

### 3. Message Deduplication
- **Purpose**: Prevent duplicate messages
- **Implementation**: Using Set to track message IDs
- **Example**:
```typescript
const processedMessageIds = new Set<string>();
if (processedMessageIds.has(msg.id)) {
  continue;
}
processedMessageIds.add(msg.id);
```

## Error Handling

### 1. Stream Errors
- **Types**:
  - Network errors
  - Agent errors
  - Tool execution errors
- **Handling**:
```typescript
try {
  // Stream handling code
} catch (error) {
  console.error('Streaming error:', error);
  controller.error(error instanceof Error ? error : new Error('Unknown error'));
}
```

### 2. Message Processing Errors
- **Types**:
  - Invalid message format
  - Missing content
  - Type mismatches
- **Handling**: Type checking and validation

## Teaching Tips

### 1. Conceptual Understanding
- Start with the big picture of swarm architecture
- Explain the benefits of specialization
- Demonstrate real-world use cases

### 2. Practical Implementation
- Walk through tool creation step by step
- Show agent configuration in detail
- Demonstrate message handling with examples

### 3. Common Pitfalls
- Message duplication
- Improper handoff handling
- Stream management issues
- Type checking oversights

### 4. Best Practices
- Keep agents focused
- Implement proper error handling
- Use type checking
- Maintain clean message flow

## Exercises

### 1. Basic Implementation
- Create a simple two-agent system
- Implement basic handoff
- Handle simple message streaming

### 2. Advanced Features
- Add more specialized agents
- Implement complex handoff scenarios
- Add conversation history management

### 3. Error Handling
- Implement comprehensive error handling
- Add retry logic
- Create fallback mechanisms

## Assessment

### 1. Knowledge Check
- What is swarm architecture?
- How do agent handoffs work?
- What are the different message types?

### 2. Implementation Check
- Can students create specialized agents?
- Do they understand message handling?
- Can they implement proper error handling?

### 3. Problem Solving
- Can they debug common issues?
- Do they understand best practices?
- Can they extend the system?

## Resources

### 1. Documentation
- [LangGraph Documentation](https://js.langchain.com/docs/modules/agents/agent_types/)
- [LangGraph Swarm Documentation](https://js.langchain.com/docs/modules/agents/agent_types/langgraph_swarm)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### 2. Code Examples
- Basic agent implementation
- Tool creation
- Message handling
- Error management

### 3. Additional Reading
- Agent architecture patterns
- Message streaming best practices
- Error handling strategies 