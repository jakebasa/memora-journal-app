import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';

export function AiChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string; entries?: any[] }>>([
    {
      role: 'ai',
      content: 'Hi! I\'m your journal assistant. Ask me about your entries, patterns in your mood, or get writing prompts! ✨'
    }
  ]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message;
    setMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('journal-token');
      
      if (!token) {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: 'Please log in to use the AI assistant.' 
        }]);
        setIsLoading(false);
        return;
      }

      console.log('Making request to:', '/api/ai/chat');
      console.log('Token exists:', !!token);
      console.log('Message:', userMessage);

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      
      // Handle different response formats
      const aiMessage: { role: 'ai'; content: string; entries?: any[] } = {
        role: 'ai',
        content: ''
      };

      if (data.entries) {
        // Format entries nicely
        aiMessage.content = data.response;
        aiMessage.entries = data.entries;
      } else if (data.response) {
        aiMessage.content = data.response;
      } else {
        aiMessage.content = 'I received an unexpected response format.';
      }

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // More detailed error handling
      let errorMessage = 'Sorry, I encountered an error while processing your request. Please try again.';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Unable to connect to the server. Please check if the backend is running.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.message.includes('403')) {
        errorMessage = 'Invalid token. Please log in again.';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error occurred. Please try again later.';
      }
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 h-96 animate-fade-in">
          <Card className="h-full shadow-xl border-border/50 glass">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Journal Assistant
              </CardTitle>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col h-full pb-4">
              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto custom-scroll mb-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`text-sm p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-6'
                        : 'bg-secondary text-secondary-foreground mr-6'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {msg.entries && msg.entries.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="text-xs font-medium opacity-70">Journal Entries:</div>
                        {msg.entries.map((entry, entryIndex) => (
                          <div key={entryIndex} className="bg-background/20 p-2 rounded text-xs">
                            <div className="font-medium">{entry.date}</div>
                            {entry.title && <div className="font-medium mt-1">{entry.title}</div>}
                            <div className="mt-1 opacity-80">{entry.content}</div>
                            {entry.mood && <div className="mt-1">Mood: {entry.mood}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="bg-secondary text-secondary-foreground mr-6 text-sm p-3 rounded-lg flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Thinking...
                  </div>
                )}
              </div>
              
              {/* Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about your entries..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-sm"
                />
                <Button
                  variant="default"
                  size="icon-sm"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Button */}
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 z-40 shadow-xl animate-float"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageSquare className="h-5 w-5" />
      </Button>
    </>
  );
}