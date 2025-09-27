import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, ChevronDown, ChevronUp, Image as ImageIcon, Globe, Brain } from 'lucide-react';
import { generateDeepseekResponse } from '../../services/deepseekService';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  image?: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant powered by Deepseek R1. I can help you with real-time market analysis, company information, or investment research.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showThinking, setShowThinking] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setMessages(prev => [...prev, {
            role: 'user',
            content: `[Uploaded file: ${file.name}]`,
            image: content
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !fileInputRef.current?.files?.length) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const prompt = `You are a helpful AI assistant for a financial market analysis platform.
      IMPORTANT: Search the web for the most up-to-date information when answering questions about:
      - Current market data and stock prices
      - Recent company news and developments
      - Economic indicators and market trends
      - Earnings reports and financial metrics
      - Industry updates and competitor analysis

      Please provide a comprehensive answer based on current information.
      Format your response with:
      1. Web search results and sources (if used)
      2. Analysis and insights
      3. Key takeaways or recommendations

      Question: ${userMessage}`;

      const response = await generateDeepseekResponse(prompt);
      const [thinking, content] = response.split('</think>');
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: content || response,
        thinking: thinking?.replace('<think>', '').trim()
      }]);
    } catch (error) {
      console.error('ChatBot error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message || 'An unexpected error occurred'}. Please try again.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Add this helper function to format the content
  const formatMessage = (content: string) => {
    // Split sections by "---"
    const sections = content.split('---').map(section => section.trim());
    
    return sections.map((section, index) => {
      // Split title and content by first "*"
      const [title, ...contentParts] = section.split('**');
      const sectionContent = contentParts.join('**')
        .replace(/\*\*/g, '') // Remove remaining asterisks
        .split('-') // Split bullet points
        .map(point => point.trim())
        .filter(Boolean); // Remove empty lines

      return (
        <div key={index} className="mb-4">
          {title && (
            <h3 className="font-bold text-lg mb-2 text-blue-600">
              {title.replace(/\*/g, '').trim()}
            </h3>
          )}
          {sectionContent.map((point, i) => (
            <div key={i} className="mb-2">
              {point.startsWith('•') ? (
                <p className="ml-4">{point}</p>
              ) : (
                <p>{point}</p>
              )}
            </div>
          ))}
        </div>
      );
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className="relative w-[90vw] h-[85vh] bg-white rounded-lg shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            <h3 className="font-medium">Deepseek R1 Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" title="Web search enabled" />
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
              title={showThinking ? "Hide thinking process" : "Show thinking process"}
            >
              {showThinking ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-700 rounded transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message, index) => (
            <div key={index} className="max-w-4xl mx-auto">
              {/* Show thinking process first if it exists */}
              {showThinking && message.thinking && message.role === 'assistant' && (
                <div className="mb-3 text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
                  <div className="font-medium mb-1">Thinking process:</div>
                  {message.thinking}
                </div>
              )}
              
              {/* Then show the message content */}
              <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.image && (
                    <img 
                      src={message.image} 
                      alt="Uploaded content"
                      className="max-w-full rounded-lg mb-2"
                    />
                  )}
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none">
                      {formatMessage(message.content)}
                    </div>
                  ) : (
                    <div>{message.content}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start max-w-4xl mx-auto">
              <div className="bg-gray-100 rounded-lg p-4">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,.pdf,.doc,.docx,.txt"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isLoading}
              >
                <ImageIcon className="h-5 w-5 text-gray-600" />
              </button>
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && !fileInputRef.current?.files?.length)}
                className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}