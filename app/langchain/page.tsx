'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import {weatherAgent, weatherAgent2, weatherAgent3} from "@/actions/1_basic-agent";

type Message = {
  id: string
  role: 'user' | 'ai'
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!inputValue.trim()) return;

    // Create a new user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim()
    }

    // Add user message to chat
    setMessages(prev => [...prev, userMessage])

    try {
      // Call the agent with user input
      const response = await weatherAgent3('Nir', inputValue.trim())

      // Process the response and extract AI messages
      if (response && response.messages) {
        // Get the last message from the response (should be the AI's response)
        const lastMessage = response.messages[response.messages.length - 1]

        if (lastMessage) {
          // Convert the LangChain message to our Message type
          const newAiMessage: Message = {
            id: Date.now().toString(),
            role: 'ai',
            content: typeof lastMessage.content === 'string'
              ? lastMessage.content
              : JSON.stringify(lastMessage.content)
          }

          // Add AI message to chat
          setMessages(prev => [...prev, newAiMessage])
        }
      }
    } catch (error) {
      console.error('Error getting response from agent:', error)
      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: 'Sorry, I encountered an error while processing your request.'
      }
      setMessages(prev => [...prev, errorMessage])
    }

    // Clear input
    setInputValue('')
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
              className="bg-black text-white border border-orange-400 px-4 py-2 rounded-lg hover:bg-orange-400 focus:outline-none cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
