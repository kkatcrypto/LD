"use client";

import React, { useRef, useEffect, useState, ChangeEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Swords, Shield, Star, Trophy, Bomb } from 'lucide-react';

type ShorthandEditorProps = {
  value: string;
  onValueChange: (value: string) => void;
  shorthandDictionary: Map<string, string>;
  isActive?: boolean;
};

export function ShorthandEditor({ value, onValueChange, shorthandDictionary, isActive }: ShorthandEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [internalValue, setInternalValue] = useState(value);
  const [cursor, setCursor] = useState<number | null>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (cursor !== null && textareaRef.current) {
      textareaRef.current.setSelectionRange(cursor, cursor);
      setCursor(null);
    }
  }, [cursor, internalValue]);

  useEffect(() => {
    if (isActive && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isActive]);
  
  const handleEditorChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const { value: currentValue, selectionStart } = e.target;
    const lastChar = currentValue[selectionStart - 1];

    if (lastChar === ' ') {
      const textBeforeCursor = currentValue.substring(0, selectionStart - 1);
      const lastWord = textBeforeCursor.split(/[\s\n]/).pop() || '';
      
      let expansion : string | undefined;
      let shorthand = lastWord;

      if (shorthandDictionary.has(lastWord)) {
        expansion = shorthandDictionary.get(lastWord)!;
      } else {
        const match = lastWord.match(/^([a-zA-Z]+)(\d+)$/);
        if (match) {
          const [, alpha, num] = match;
          if (shorthandDictionary.has(alpha)) {
            expansion = `${shorthandDictionary.get(alpha)!} ${num}`;
          }
        }
      }
      
      if (expansion) {
        const newValue = 
          textBeforeCursor.substring(0, textBeforeCursor.length - shorthand.length) +
          expansion +
          currentValue.substring(selectionStart - 1);
        
        const newCursorPos = selectionStart - shorthand.length + expansion.length;
        
        setInternalValue(newValue);
        setCursor(newCursorPos);
        onValueChange(newValue);
        return;
      }
    }
    setInternalValue(currentValue);
    onValueChange(currentValue);
  };
  
  const insertTag = (tag: string) => {
    if (!textareaRef.current) return;
    const { selectionStart, selectionEnd, value: currentValue } = textareaRef.current;

    const textToInsert = `[${tag}] `;
    const newValue = 
        currentValue.substring(0, selectionStart) + 
        textToInsert + 
        currentValue.substring(selectionEnd);
    
    setInternalValue(newValue);
    onValueChange(newValue);

    const newCursorPos = selectionStart + textToInsert.length;
    setTimeout(() => {
        if(textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
    }, 0);
  };

  const editorTags = [
    { name: 'Offense', icon: Swords, tag: 'O' },
    { name: 'Defense', icon: Shield, tag: 'D' },
    { name: 'Impact', icon: Bomb, tag: 'I' },
    { name: 'Winning Point', icon: Trophy, tag: 'Win' },
    { name: 'Key Voter', icon: Star, tag: 'Voter' },
  ];

  return (
    <div className="flex flex-col flex-grow h-full">
      <div className="p-1 border-b border-border/50 bg-card/50">
         <TooltipProvider>
            <div className="flex items-center gap-1">
                {editorTags.map(item => (
                    <Tooltip key={item.name}>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => insertTag(item.tag)}>
                                <item.icon className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Tag as {item.name}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
         </TooltipProvider>
      </div>
      <Textarea
        ref={textareaRef}
        value={internalValue}
        onChange={handleEditorChange}
        placeholder="Start flowing..."
        className="flex-grow w-full h-full p-3 resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent font-code text-sm leading-relaxed"
      />
    </div>
  );
}
