# Teaching Guide: Tools in LangGraph Agents

## Overview
This guide covers how to implement and use tools in LangGraph agents, a fundamental concept for extending agent capabilities with custom functionality.

## Key Concepts

### 1. Tool Structure
- Function implementation
- Schema definition
- Metadata (name, description)
- Error handling

### 2. Tool Types
- Basic tools (simple functions)
- Tools with state
- Tools with custom updates
- Tools with direct returns

### 3. Tool Integration
- Agent configuration
- Tool registration
- Error handling
- Response processing

## Teaching Points

### 1. Basic Tool Creation
- Using the `tool` function
- Schema definition with Zod
- Function implementation
- Metadata configuration

### 2. Advanced Tool Features
- State management
- Custom updates
- Error handling
- Direct returns

### 3. Tool Best Practices
- Clear schemas
- Descriptive names
- Proper error handling
- Type safety

## Common Challenges

1. **Schema Definition**
   - Students might struggle with Zod schema creation
   - Solution: Start with simple schemas and gradually add complexity

2. **Error Handling**
   - Proper error propagation
   - User-friendly error messages
   - Error recovery strategies

3. **Type Safety**
   - TypeScript interfaces
   - Schema validation
   - Runtime type checking

## Best Practices

1. **Tool Design**
   - Single responsibility
   - Clear input/output
   - Proper error handling
   - Type safety

2. **Documentation**
   - Clear descriptions
   - Example usage
   - Parameter documentation
   - Error scenarios

3. **Integration**
   - Proper tool registration
   - Error handling
   - Response processing
   - State management

## Resources
- [LangGraph Tools Documentation](https://langchain-ai.github.io/langgraphjs/agents/tools/)
- Example implementation in `actions/3_tools.ts`
- Reference implementation in `actions/2_streaming.ts` 