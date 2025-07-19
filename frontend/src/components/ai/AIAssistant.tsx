import React, { useState, useRef, useEffect } from 'react';
import {
  SparklesIcon,
  CodeBracketIcon,
  CubeIcon,
  DocumentTextIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  ClipboardDocumentIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface AIAssistantProps {
  isOpen: boolean;
  onToggle: () => void;
  systemId?: string;
  selectedComponent?: any;
}

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: 'code-generation' | 'optimization' | 'architecture' | 'documentation';
  data?: any;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  isOpen,
  onToggle,
  systemId,
  selectedComponent
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const iconStyle = { width: '1rem', height: '1rem', maxWidth: '1rem', maxHeight: '1rem' };
  const largeIconStyle = { width: '1.25rem', height: '1.25rem', maxWidth: '1.25rem', maxHeight: '1.25rem' };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message
      setMessages([{
        id: '1',
        type: 'assistant',
        content: `Hello! I'm your AI assistant. I can help you with:

• **Code Generation** - Generate code for your components
• **Architecture Suggestions** - Get recommendations for system design
• **Code Optimization** - Improve existing code performance
• **Documentation** - Generate documentation for your systems

What would you like help with today?`,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Determine the type of request based on message content
      const action = detectAction(inputMessage);
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: inputMessage,
          action,
          context: {
            systemId,
            selectedComponent,
            previousMessages: messages.slice(-5) // Last 5 messages for context
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: AIMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: data.data.response,
          timestamp: new Date(),
          action: data.data.action,
          data: data.data.additionalData
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error?.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('AI Assistant error:', error);
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or rephrase your question.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const detectAction = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('generate') && (lowerMessage.includes('code') || lowerMessage.includes('function'))) {
      return 'code-generation';
    }
    if (lowerMessage.includes('optimize') || lowerMessage.includes('improve') || lowerMessage.includes('performance')) {
      return 'optimization';
    }
    if (lowerMessage.includes('architecture') || lowerMessage.includes('design') || lowerMessage.includes('structure')) {
      return 'architecture';
    }
    if (lowerMessage.includes('document') || lowerMessage.includes('docs') || lowerMessage.includes('readme')) {
      return 'documentation';
    }
    
    return 'general';
  };

  const handleQuickAction = async (action: string, prompt: string) => {
    setActiveAction(action);
    setInputMessage(prompt);
    
    // Auto-send the message
    setTimeout(() => {
      handleSendMessage();
      setActiveAction(null);
    }, 100);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatMessage = (message: AIMessage) => {
    const content = message.content;
    
    // Check if message contains code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index)
        });
      }
      
      // Add code block
      parts.push({
        type: 'code',
        language: match[1] || 'text',
        content: match[2].trim()
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex)
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content }];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: '#8b5cf6',
          color: 'white',
          padding: '1rem',
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          zIndex: 40,
          transition: 'all 0.15s ease-in-out'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#7c3aed';
          e.target.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#8b5cf6';
          e.target.style.transform = 'scale(1)';
        }}
      >
        <SparklesIcon style={{ width: '1.5rem', height: '1.5rem' }} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      width: '400px',
      height: '600px',
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SparklesIcon style={largeIconStyle} />
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
            AI Assistant
          </h3>
        </div>
        <button
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'white',
            padding: '0.25rem',
            borderRadius: '0.25rem',
            transition: 'all 0.15s ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <XMarkIcon style={largeIconStyle} />
        </button>
      </div>

      {/* Quick Actions */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      }}>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>
          Quick Actions:
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleQuickAction('code-generation', 'Generate a REST API endpoint for user authentication')}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: activeAction === 'code-generation' ? '#3b82f6' : 'white',
              color: activeAction === 'code-generation' ? 'white' : '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease-in-out'
            }}
          >
            <CodeBracketIcon style={{ width: '0.875rem', height: '0.875rem' }} />
            Code
          </button>
          <button
            onClick={() => handleQuickAction('architecture', 'Suggest an architecture for a scalable web application')}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: activeAction === 'architecture' ? '#3b82f6' : 'white',
              color: activeAction === 'architecture' ? 'white' : '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease-in-out'
            }}
          >
            <CubeIcon style={{ width: '0.875rem', height: '0.875rem' }} />
            Architecture
          </button>
          <button
            onClick={() => handleQuickAction('documentation', 'Generate documentation for this system')}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: activeAction === 'documentation' ? '#3b82f6' : 'white',
              color: activeAction === 'documentation' ? 'white' : '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease-in-out'
            }}
          >
            <DocumentTextIcon style={{ width: '0.875rem', height: '0.875rem' }} />
            Docs
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '1rem',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
              gap: '0.5rem',
              alignItems: 'flex-start'
            }}
          >
            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                backgroundColor: message.type === 'user' ? '#3b82f6' : '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: '600',
                flexShrink: 0
              }}
            >
              {message.type === 'user' ? 'U' : <SparklesIcon style={{ width: '1rem', height: '1rem' }} />}
            </div>
            <div
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '0.75rem',
                backgroundColor: message.type === 'user' ? '#3b82f6' : '#f3f4f6',
                color: message.type === 'user' ? 'white' : '#1f2937',
                maxWidth: '85%'
              }}
            >
              {formatMessage(message).map((part, index) => (
                <div key={index}>
                  {part.type === 'text' ? (
                    <div style={{
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {part.content}
                    </div>
                  ) : (
                    <div style={{
                      marginTop: index > 0 ? '0.5rem' : 0,
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#1f2937',
                        color: 'white',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '0.375rem 0.375rem 0 0',
                        fontSize: '0.75rem'
                      }}>
                        <span>{part.language}</span>
                        <button
                          onClick={() => copyToClipboard(part.content)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            borderRadius: '0.25rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem'
                          }}
                        >
                          {copiedCode === part.content ? (
                            <>
                              <CheckIcon style={{ width: '0.875rem', height: '0.875rem' }} />
                              Copied
                            </>
                          ) : (
                            <>
                              <ClipboardDocumentIcon style={{ width: '0.875rem', height: '0.875rem' }} />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <pre style={{
                        backgroundColor: '#f8f9fa',
                        color: '#1f2937',
                        padding: '0.75rem',
                        borderRadius: '0 0 0.375rem 0.375rem',
                        fontSize: '0.75rem',
                        overflow: 'auto',
                        margin: 0,
                        fontFamily: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                      }}>
                        <code>{part.content}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ))}
              <div style={{
                fontSize: '0.625rem',
                color: message.type === 'user' ? 'rgba(255, 255, 255, 0.7)' : '#9ca3af',
                marginTop: '0.5rem'
              }}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-start'
          }}>
            <div
              style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                backgroundColor: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                flexShrink: 0
              }}
            >
              <SparklesIcon style={{ width: '1rem', height: '1rem' }} />
            </div>
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '0.75rem',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <div style={{
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                backgroundColor: '#8b5cf6',
                animation: 'pulse 1.5s ease-in-out infinite'
              }} />
              <div style={{
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                backgroundColor: '#8b5cf6',
                animation: 'pulse 1.5s ease-in-out infinite 0.2s'
              }} />
              <div style={{
                width: '0.5rem',
                height: '0.5rem',
                borderRadius: '50%',
                backgroundColor: '#8b5cf6',
                animation: 'pulse 1.5s ease-in-out infinite 0.4s'
              }} />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-end'
        }}>
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your system..."
            disabled={isLoading}
            style={{
              flex: 1,
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              resize: 'none',
              minHeight: '2.5rem',
              maxHeight: '6rem',
              outline: 'none',
              backgroundColor: isLoading ? '#f3f4f6' : 'white',
              color: isLoading ? '#9ca3af' : '#1f2937'
            }}
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            style={{
              padding: '0.75rem',
              backgroundColor: (!inputMessage.trim() || isLoading) ? '#d1d5db' : '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: (!inputMessage.trim() || isLoading) ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              if (inputMessage.trim() && !isLoading) {
                e.target.style.backgroundColor = '#7c3aed';
              }
            }}
            onMouseLeave={(e) => {
              if (inputMessage.trim() && !isLoading) {
                e.target.style.backgroundColor = '#8b5cf6';
              }
            }}
          >
            <PaperAirplaneIcon style={iconStyle} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;