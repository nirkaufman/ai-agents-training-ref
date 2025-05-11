# Teaching Guide: LangChain Basic Agent

## Core Concepts

### 1. What is an Agent?
An agent is an AI system that can:
- Understand user requests
- Decide which tools to use
- Execute actions using those tools
- Provide responses based on the results

Think of it as a smart assistant that can use different tools to help users accomplish tasks.

### 2. Why Use Agents?
- **Autonomy**: Agents can make decisions about which tools to use
- **Flexibility**: Can handle complex tasks by combining multiple tools
- **Context Awareness**: Can maintain conversation history and context
- **Extensibility**: Easy to add new capabilities through tools

## Technical Components

### 1. Tools
```typescript
const tool = (
  async (input: { param: string }) => {
    // Tool implementation
  },
  {
    name: "toolName",
    description: "What the tool does",
    schema: z.object({
      param: z.string().describe("Parameter description")
    })
  }
);
```

**Key Points to Explain:**
- Tools are functions that perform specific tasks
- Each tool has a name, description, and input schema
- The schema helps the agent understand when to use the tool
- Tools can be simple (like our weather tool) or complex (like API calls)

### 2. Language Model (LLM)
```typescript
const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
});
```

**Key Points to Explain:**
- LLMs are the "brain" of the agent
- Temperature controls randomness (0 = more deterministic)
- Different models have different capabilities and costs
- The LLM helps the agent understand and respond to user requests

### 3. Agent Creation
```typescript
const agent = createReactAgent({
  llm,
  tools: [tool1, tool2],
  prompt: "System prompt"
});
```

**Key Points to Explain:**
- `createReactAgent` is a factory function that creates agents
- Agents combine LLMs with tools
- System prompts guide the agent's behavior
- Multiple tools can be provided to the agent

## Advanced Concepts

### 1. Dynamic Prompts
```typescript
const prompt = (state, config) => {
  const userName = config.configurable?.userName;
  return [{role: "system", content: `Hello ${userName}`}, ...state.messages];
};
```

**Teaching Points:**
- Prompts can be dynamic based on context
- Useful for personalization
- Can include user preferences or settings
- Helps make the agent more adaptable

### 2. Memory Management
```typescript
const checkpointer = new MemorySaver();
const agent = createReactAgent({
  // ... other config
  checkpointer
});
```

**Teaching Points:**
- Memory helps maintain conversation context
- Useful for multi-turn conversations
- Can reference previous interactions
- Important for natural conversation flow

## Common Questions and Answers

### 1. "Why do we need tools?"
- Tools give agents specific capabilities
- Without tools, agents can only talk
- Tools allow agents to perform actions
- Makes agents more useful and practical

### 2. "What's the difference between a static and dynamic prompt?"
- Static prompts are fixed
- Dynamic prompts can change based on context
- Dynamic prompts are more flexible
- Useful for personalization

### 3. "Why do we need memory?"
- Helps maintain conversation context
- Allows for more natural conversations
- Enables reference to previous interactions
- Makes the agent more helpful

## Teaching Tips

### 1. Start Simple
1. Begin with a basic agent and one tool
2. Show how the agent uses the tool
3. Add more tools gradually
4. Introduce advanced features last

### 2. Use Analogies
- Agent = Smart Assistant
- Tools = Specialized Skills
- LLM = Brain
- Memory = Short-term Memory

### 3. Practical Examples
1. Show the weather tool example
2. Demonstrate how the agent decides to use it
3. Show how responses are formatted
4. Demonstrate error handling

### 4. Common Pitfalls to Address
1. Tool schema definition
2. Error handling
3. Message serialization
4. Type safety
5. Memory management

## Code Walkthrough Structure

1. **Tool Definition**
   - Show the basic structure
   - Explain the schema
   - Demonstrate error handling

2. **Agent Setup**
   - LLM configuration
   - Tool registration
   - Prompt definition

3. **Usage Examples**
   - Basic usage
   - Dynamic prompts
   - Memory management

4. **Best Practices**
   - Error handling
   - Type safety
   - Response formatting
   - Memory management

## Assessment Ideas

1. **Basic Understanding**
   - Create a simple tool
   - Set up a basic agent
   - Handle basic responses

2. **Intermediate Skills**
   - Implement dynamic prompts
   - Add multiple tools
   - Handle errors properly

3. **Advanced Concepts**
   - Implement memory management
   - Create complex tool combinations
   - Handle edge cases

## Resources for Further Learning

1. **Documentation**
   - [LangChain Documentation](https://js.langchain.com/docs/)
   - [TypeScript Documentation](https://www.typescriptlang.org/docs/)
   - [Next.js Documentation](https://nextjs.org/docs)

2. **Related Concepts**
   - Natural Language Processing
   - TypeScript Type System
   - Error Handling
   - State Management

3. **Advanced Topics**
   - Streaming Responses
   - Authentication
   - Rate Limiting
   - Caching 