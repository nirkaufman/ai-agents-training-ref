'use client';

import {useState, useRef, useEffect} from 'react';

import {useActions, useUIState} from 'ai/rsc';
import {AI} from "@/actions/multi-step/ai-context-provider";

export default function Page() {
  const [input, setInput] = useState<string>('');
  const [conversation, setConversation] = useUIState<typeof AI>();
  const {submitUserMessage} = useActions();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return; // Prevent empty messages

    const userMessage = input;
    setInput('');
    setConversation(currentConversation => [
      ...currentConversation,
      <div className="p-3 bg-indigo-700 text-white rounded-lg self-end max-w-[80%] break-words">
        {userMessage}
      </div>,
    ]);
    const message = await submitUserMessage(userMessage);
    setConversation(currentConversation => [...currentConversation,
      <div className="p-3 bg-gray-800 text-gray-100 border border-gray-700 rounded-lg self-start max-w-[80%] shadow-sm break-words">
        {message}
      </div>
    ]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="py-4 px-6 bg-indigo-800 text-white shadow-md">
        <h1 className="text-xl font-semibold">Flight Booking Assistant</h1>
      </div>
  
      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
        <div className="max-w-3xl mx-auto flex flex-col space-y-4">
          {conversation.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <div className="text-5xl mb-3">✈️</div>
              <p className="text-lg">How can I help with your travel plans today?</p>
            </div>
          ) : (
            conversation.map((message, i) => (
              <div
                key={i}
                className="flex w-full"
              >
                <div className={`w-full flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  {message}
                </div>
              </div>
            ))
          )}
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </div>
  
      {/* Input Area - Fixed at Bottom */}
      <div className="border-t border-gray-700 bg-gray-800 p-4 shadow-lg">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 text-white py-3 px-4 rounded-full border border-gray-600 bg-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white rounded-full px-5 py-3 font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center"
            disabled={!input.trim()}
          >
            <span>Send</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
