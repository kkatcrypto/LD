
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, LoaderCircle, Send, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateRebuttalAction } from '@/app/actions';
import { cn } from '@/lib/utils';

type Message = {
  sender: 'user' | 'bot';
  text: string;
};

type RebuttalChatbotProps = {
  isOpen: boolean;
  onClose: () => void;
  getDebateContext: () => string;
};

export function RebuttalChatbot({ isOpen, onClose, getDebateContext }: RebuttalChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const debateContext = getDebateContext();
      const result = await generateRebuttalAction({
        context: debateContext,
        argument: input,
      });
      const botMessage: Message = { sender: 'bot', text: result.rebuttal };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        sender: 'bot',
        text: 'Sorry, I encountered an error and could not generate a rebuttal.',
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Rebuttal generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-16 right-4 z-50 w-full max-w-md">
      <div className="bg-card border border-border rounded-lg shadow-xl flex flex-col h-[60vh]">
        <header className="flex items-center justify-between p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-bold font-headline">Rebuttal Assistant</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close chatbot">
            <X className="h-4 w-4" />
          </Button>
        </header>

        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
                 <div className="text-center text-muted-foreground p-8">
                    <Sparkles className="mx-auto h-8 w-8 mb-2" />
                    <p>Paste an argument or speech segment below to get an instant rebuttal.</p>
                </div>
            ) : (
                messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))
            )}
             {isLoading && (
              <div className="flex justify-start gap-3">
                <div className="bg-secondary rounded-lg px-3 py-2">
                  <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <footer className="p-3 border-t border-border">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste argument to rebut..."
              className="flex-grow resize-none text-sm"
              rows={2}
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </footer>
      </div>
    </div>
  );
}
