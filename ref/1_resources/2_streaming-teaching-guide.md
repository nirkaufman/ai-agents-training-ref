# Teaching Guide: Streaming in LangGraph Agents

## Overview
This guide covers how to implement streaming responses in LangGraph agents, a crucial feature for building responsive AI applications.

## Key Concepts

### 1. Types of Streaming
- **Agent Progress**: Updates after each node execution
- **LLM Tokens**: Real-time token generation
- **Tool Updates**: Custom data from tools during execution
- **Multiple Modes**: Combining different streaming types

### 2. Streaming Modes
- `updates`: Agent progress updates
- `messages`: LLM token streaming
- `custom`: Tool-specific updates

### 3. Implementation Components
- ReadableStream for server-side streaming
- Controller for managing stream chunks
- Different chunk types (agent, tools, intermediate steps)

## Teaching Points

### 1. Basic Streaming Setup
- Server action declaration with 'use server'
- ReadableStream creation
- Controller management

### 2. Chunk Processing
- Agent messages
- Tool responses
- Intermediate steps
- Generated reasoning

### 3. Error Handling
- Try-catch blocks
- Stream closure
- Error propagation

## Common Challenges

1. **Chunk Type Identification**
   - Students might struggle with identifying different chunk types
   - Solution: Use clear conditional checks and logging

2. **Stream Management**
   - Proper stream closure
   - Error handling
   - Memory management

3. **Type Safety**
   - TypeScript interfaces for different chunk types
   - Proper type checking

## Best Practices

1. **Code Organization**
   - Separate streaming logic
   - Clear chunk type handling
   - Proper error boundaries

2. **Performance**
   - Efficient chunk processing
   - Memory management
   - Stream closure

3. **User Experience**
   - Meaningful chunk formatting
   - Clear progress indicators
   - Error feedback

## Resources
- [LangGraph Streaming Documentation](https://langchain-ai.github.io/langgraphjs/agents/streaming/)
- Example implementation in `actions/2_streaming.ts`
- Reference implementation in `actions/3_tools.ts` 