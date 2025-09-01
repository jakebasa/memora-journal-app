import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Message {
    role: 'user' | 'ai';
    content: string;
    entries?: any[];
    isTyping?: boolean;
}

interface ChatContextType {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'ai',
            content: "Hi! I'm your journal assistant. Ask me about your entries, patterns in your mood, or get writing prompts! ✨",
        },
    ]);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <ChatContext.Provider value={{ messages, setMessages, isOpen, setIsOpen }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
