# Teaching Guide: Tools in LangGraph Agents

## Core Concepts

### 1. Tools in LangGraph
Tools are the fundamental building blocks that extend an agent's capabilities. They are:
- Functions that the agent can call to perform specific tasks
- Defined with a clear input/output interface
- Self-contained and focused on a single responsibility
- Integrated into the agent's decision-making process

### 2. Tool Structure
Each tool consists of three main components:
- **Function**: The actual implementation of the tool's logic
- **Schema**: Input validation and type definition using Zod
- **Metadata**: Name, description, and other tool-specific information

### 3. Tool Types
There are several ways to implement tools:
- **Basic Tools**: Simple function implementations
- **Tools with State**: Tools that maintain internal state
- **Tools with Updates**: Tools that provide progress updates
- **Tools with Direct Returns**: Tools that return results directly to the user

## Key Components

### 1. Tool Function
```typescript
const tool = tool(
  async (input: ToolInput) => {
    // Tool implementation
    return result;
  },
  {
    name: "tool-name",
    description: "tool description",
    schema: z.object({...})
  }
)
```

### 2. Schema Definition
```typescript
const schema = z.object({
  field1: z.string().describe("field description"),
  field2: z.number().optional(),
  field3: z.enum(["option1", "option2"])
})
```

### 3. Tool Integration
```typescript
const agent = createReactAgent({
  llm,
  tools: [tool1, tool2, tool3],
  // other configuration
});
```

## Teaching Points

### 1. Tool Design Principles
- **Single Responsibility**: Each tool should do one thing well
- **Clear Interface**: Input/output should be well-defined
- **Error Handling**: Tools should handle errors gracefully
- **Documentation**: Tools should be self-documenting

### 2. Schema Design
- Use descriptive field names
- Add helpful descriptions
- Choose appropriate types
- Include validation rules
- Consider optional fields

### 3. Tool Implementation
- Keep functions pure when possible
- Handle async operations properly
- Provide meaningful error messages
- Consider performance implications

### 4. Agent Integration
- Tool selection strategy
- Error handling at agent level
- Response formatting
- Tool combination patterns

## Common Challenges

### 1. Schema Definition
- **Challenge**: Creating comprehensive schemas
- **Solution**: Use Zod's rich type system and descriptions

### 2. Error Handling
- **Challenge**: Managing tool failures
- **Solution**: Implement proper error handling and fallbacks

### 3. Type Safety
- **Challenge**: Maintaining type safety across tools
- **Solution**: Use TypeScript interfaces and Zod schemas

### 4. Tool Selection
- **Challenge**: Helping agent choose the right tool
- **Solution**: Clear tool descriptions and examples

## Best Practices

### 1. Tool Design
- Keep tools focused and single-purpose
- Use clear, descriptive names
- Provide detailed descriptions
- Include example usage

### 2. Schema Design
- Use descriptive field names
- Add helpful descriptions
- Use appropriate Zod types
- Include validation rules

### 3. Error Handling
- Always handle potential errors
- Provide meaningful error messages
- Use try-catch blocks
- Consider fallback options

### 4. Performance
- Keep tools lightweight
- Use async/await properly
- Consider caching for expensive operations
- Provide progress updates for long operations

## API Reference

### 1. Tool Creation
```typescript
tool(
  func: (input: InputType) => Promise<OutputType>,
  config: {
    name: string;
    description: string;
    schema: ZodSchema;
    returnDirect?: boolean;
  }
)
```

### 2. Schema Definition
```typescript
z.object({
  field: z.string().describe("description"),
  optionalField: z.number().optional(),
  enumField: z.enum(["option1", "option2"]),
  arrayField: z.array(z.string())
})
```

### 3. Agent Configuration
```typescript
createReactAgent({
  llm: ChatOpenAI,
  tools: Tool[],
  checkpointer?: MemorySaver,
  // other options
})
```

## Resources
- [LangGraph Tools Documentation](https://langchain-ai.github.io/langgraphjs/agents/tools/)
- [Zod Documentation](https://zod.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- Example implementation in `actions/3_tools.ts`

## Teaching Tips

1. **Start Simple**
   - Begin with basic tools
   - Gradually introduce complexity
   - Use real-world examples

2. **Hands-on Practice**
   - Have students implement simple tools
   - Practice schema definition
   - Experiment with tool combinations

3. **Debugging**
   - Teach common error patterns
   - Show debugging techniques
   - Practice error handling

4. **Advanced Topics**
   - Tool composition
   - State management
   - Performance optimization
   - Security considerations 