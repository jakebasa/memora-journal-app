import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquare, X, Send, Sparkles, Loader2, Eye, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { buildApiUrl, devLog, devError } from '@/config/api';
import { useChat } from '@/contexts/ChatContext';
import { useEntries } from '@/hooks/useEntries';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

export function AiChatButton() {
    const { messages, setMessages, isOpen, setIsOpen } = useChat();
    const { entries } = useEntries();
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    interface JournalEntry {
        _id: string;
        date: string;
        title: string;
        content: string;
        mood?: string;
    }

    // Message component without typing effect
    const MessageDisplay = ({
        msg,
    }: {
        msg: { role: 'user' | 'ai'; content: string; entries?: JournalEntry[] };
    }) => {
        return (
            <div
                className={`text-sm p-3 rounded-lg max-w-fit ${
                    msg.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : 'bg-secondary text-secondary-foreground mr-auto'
                }`}
            >
                <div className='whitespace-pre-wrap'>{msg.content}</div>
                {msg.entries && msg.entries.length > 0 && (
                    <div className='mt-3 space-y-2'>
                        <div className='text-xs font-medium opacity-70'>
                            Journal Entries:
                        </div>
                        {msg.entries.map((entry, entryIndex) => (
                            <div
                                key={entryIndex}
                                className='bg-background/20 p-2 rounded text-xs'
                            >
                                <div className='flex items-center justify-between'>
                                    <div className='flex-1'>
                                        <div className='font-medium'>
                                            {entry.date}
                                        </div>
                                        {entry.title && (
                                            <div className='font-medium mt-1'>
                                                {entry.title}
                                            </div>
                                        )}
                                        <div className='mt-1 opacity-80'>
                                            {entry.content}
                                        </div>
                                        {entry.mood && (
                                            <div className='mt-1'>
                                                Mood: {entry.mood}
                                            </div>
                                        )}
                                    </div>
                                    {entry._id && (
                                        <Button
                                            variant='outline'
                                            size='sm'
                                            asChild
                                            className='ml-2 text-xs px-2 py-1'
                                        >
                                            <Link to={`/entries/${entry._id}`}>
                                                View
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // Helper function to get contextual entries based on user message
    const getContextualEntries = (userMessage: string) => {
        const lowerMessage = userMessage.toLowerCase();
        const now = new Date();
        
        // Check for temporal keywords
        if (lowerMessage.includes('yesterday')) {
            const yesterday = subDays(now, 1);
            const startYesterday = startOfDay(yesterday);
            const endYesterday = endOfDay(yesterday);
            
            return entries.filter(entry => {
                const entryDate = new Date(entry.createdAt);
                return isWithinInterval(entryDate, { start: startYesterday, end: endYesterday });
            });
        }
        
        if (lowerMessage.includes('today')) {
            const startToday = startOfDay(now);
            const endToday = endOfDay(now);
            
            return entries.filter(entry => {
                const entryDate = new Date(entry.createdAt);
                return isWithinInterval(entryDate, { start: startToday, end: endToday });
            });
        }
        
        if (lowerMessage.includes('last week') || lowerMessage.includes('this week')) {
            const lastWeek = subDays(now, 7);
            
            return entries.filter(entry => {
                const entryDate = new Date(entry.createdAt);
                return entryDate >= lastWeek;
            });
        }
        
        // For general questions, provide recent context (last 5 entries)
        return entries.slice(0, 5);
    };

    const handleSendMessage = async () => {
        if (!message.trim() || isLoading) return;

        const userMessage = message.trim();
        setMessage('');
        setIsLoading(true);

        // Add user message
        setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

        // Add typing indicator
        setMessages((prev) => [
            ...prev,
            { role: 'ai', content: '', isTyping: true },
        ]);

        try {
            // Get JWT token from localStorage
            const token = localStorage.getItem('journal-token');

            if (!token) {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'ai',
                        content: 'Please log in to use the writing assistant.',
                    },
                ]);
                setIsLoading(false);
                return;
            }

            // Get contextual entries based on user message
            const contextualEntries = getContextualEntries(userMessage);
            
            // Create enhanced message with context
            const enhancedMessage = {
                message: userMessage,
                context: {
                    currentDate: format(new Date(), 'yyyy-MM-dd'),
                    currentTime: format(new Date(), 'HH:mm'),
                    timezone: 'Asia/Manila',
                    recentEntries: contextualEntries.map(entry => ({
                        id: entry._id,
                        title: entry.title,
                        content: entry.content.substring(0, 500), // Limit content length
                        mood: entry.mood,
                        date: format(new Date(entry.createdAt), 'yyyy-MM-dd'),
                        time: format(new Date(entry.createdAt), 'HH:mm')
                    }))
                }
            };


            const response = await fetch(buildApiUrl('/api/ai/chat'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(enhancedMessage),
            });

            devLog('Response status:', response.status);
            devLog('Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                devError('Error response:', errorText);
                throw new Error(
                    `HTTP error! status: ${response.status}, message: ${errorText}`
                );
            }

            const data = await response.json();

            // Remove typing indicator and add real response
            setMessages((prev) => prev.filter((msg) => !msg.isTyping));

            // Handle different response formats
            const aiMessage: { role: 'ai'; content: string; entries?: JournalEntry[] } =
                {
                    role: 'ai',
                    content: '',
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

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);

            // More detailed error handling
            let errorMessage =
                'Sorry, I encountered an error while processing your request. Please try again.';

            if (error instanceof TypeError && error.message.includes('fetch')) {
                errorMessage =
                    'Unable to connect to the server. Please check if the backend is running.';
            } else if (error.message.includes('401')) {
                errorMessage = 'Authentication failed. Please log in again.';
            } else if (error.message.includes('403')) {
                errorMessage = 'Invalid token. Please log in again.';
            } else if (error.message.includes('500')) {
                errorMessage = 'Server error occurred. Please try again later.';
            }

            // Remove typing indicator on error
            setMessages((prev) => prev.filter((msg) => !msg.isTyping));

            setMessages((prev) => [
                ...prev,
                {
                    role: 'ai',
                    content: errorMessage,
                },
            ]);
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
                <div className='fixed bottom-4 right-4 z-50 w-80 h-96'>
                    <div className='h-full bg-background border border-border rounded-lg shadow-xl flex flex-col'>
                        {/* Header */}
                        <div className='flex items-center justify-between p-3 border-b border-border'>
                            <div className='flex items-center gap-2'>
                                <Sparkles className='h-4 w-4 text-primary' />
                                <span className='text-sm font-medium'>
                                    Journal Assistant
                                </span>
                            </div>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => setIsOpen(false)}
                                className='h-6 w-6 p-0'
                            >
                                <X className='h-3 w-3' />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className='flex-1 overflow-y-auto p-3 space-y-3 custom-scroll'>
                            {messages.map((msg, index) => {
                                if (msg.isTyping) {
                                    return (
                                        <div
                                            key={`typing-${index}`}
                                            className='bg-secondary text-secondary-foreground mr-6 text-sm p-3 rounded-lg max-w-fit'
                                        >
                                            <div className='flex items-center gap-2'>
                                                <div className='flex space-x-1'>
                                                    <div
                                                        className='w-2 h-2 bg-current rounded-full animate-bounce'
                                                        style={{
                                                            animationDelay:
                                                                '0ms',
                                                        }}
                                                    ></div>
                                                    <div
                                                        className='w-2 h-2 bg-current rounded-full animate-bounce'
                                                        style={{
                                                            animationDelay:
                                                                '150ms',
                                                        }}
                                                    ></div>
                                                    <div
                                                        className='w-2 h-2 bg-current rounded-full animate-bounce'
                                                        style={{
                                                            animationDelay:
                                                                '300ms',
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                return <MessageDisplay key={`message-${index}-${msg.role}`} msg={msg} />;
                            })}
                        </div>

                        {/* Input Area */}
                        <div className='border-t border-border p-3'>
                            <div className='flex gap-2'>
                                <input
                                    type='text'
                                    placeholder='Ask about your entries...'
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className='flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary'
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!message.trim() || isLoading}
                                    className='px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    {isLoading ? (
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                    ) : (
                                        <Send className='h-4 w-4' />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Button */}
            {!isOpen && (
                <Button
                    variant='default'
                    size='icon'
                    className='fixed bottom-6 right-6 z-40 shadow-xl animate-float'
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <MessageSquare className='h-5 w-5' />
                </Button>
            )}
        </>
    );
}
