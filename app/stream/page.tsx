'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import {streamAgentResponse} from "@/actions/2_streaming";
import { streamBookingAgentResponse } from '@/actions/3_tools';
import {streamWithHumanInTheLoop} from "@/actions/4_human-in-the-loop";
import {streamSupervisorResponse} from "@/actions/5_supervisor";
import {streamSwarmResponse} from "@/actions/6_swarm";


type Message = {
  id: string
  role: 'user' | 'ai'
  content: string
}

// Helper function to generate unique IDs
const generateId = (() => {
  let counter = 0;
  return () => `${Date.now()}-${counter++}`;
})();

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Automatically scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()



    if (!inputValue.trim()) return

    // Add a user message to the chat with unique ID
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: inputValue.trim()
    }

    setMessages(prev => [...prev, userMessage])

    // Store user input and clear the form
    const userPrompt = inputValue

    setInputValue('')

    try {
      // Add an empty AI message that will be populated with streaming content
      const aiMessageId = generateId()

      setMessages(prev => [...prev, {
        id: aiMessageId,
        role: 'ai',
        content: ''
      }])

      // Start streaming
      // const stream = await streamAgentResponse(userPrompt)
      // const stream = await streamBookingAgentResponse(userPrompt)
      // const stream = await streamWithHumanInTheLoop(userPrompt)
      // const stream = await streamSupervisorResponse(userPrompt)
      const stream = await streamSwarmResponse(userPrompt)
      const reader = stream.getReader()

      // Process the stream
      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        // Update the AI message content with each chunk
        setMessages(prev => {
          const aiMessage = prev.find(msg => msg.id === aiMessageId)
          if (!aiMessage) return prev

          return prev.map(msg =>
              msg.id === aiMessageId
                  ? { ...msg, content: msg.content + value }
                  : msg
          )
        })
      }
    } catch (error) {
      console.error('Streaming error:', error)

      // Add an error message with unique ID
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'ai',
        content: 'Sorry, there was an error processing your request.'
      }])
    }
  }

  return (
      <div className="flex flex-col h-screen">
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="max-w-2xl mx-auto">
            {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  Start a conversation by typing a message below
                </div>
            ) : (
                messages.map((message) => (
                    <div
                        key={message.id}
                        className={`mb-4 p-4 rounded-lg ${
                            message.role === 'user'
                                ? 'border-white border mr-auto max-w-[80%]'
                                : 'border-orange-400 border ml-auto max-w-[80%]'
                        }`}
                    >
                      <div className="text-sm font-semibold mb-1">
                        {message.role === 'user' ? 'You:' : 'AI:'}
                      </div>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input form fixed at the bottom */}
        <div className="border-t border-gray-200 bg-black">
          <div className="max-w-2xl mx-auto p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                  autoFocus
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
              />
              <button
                  type="submit"
                  className={`bg-black text-white border border-orange-400 px-4 py-2 rounded-lg opacity-50 focus:outline-none cursor-pointer`}
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
  )
}
