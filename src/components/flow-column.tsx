
'use client';

import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShorthandEditor } from '@/components/shorthand-editor';
import { cn } from '@/lib/utils';

type FlowColumnProps = {
  title: string;
  content: string;
  shorthandDictionary: Map<string, string>;
  onContentChange: (content: string) => void;
  isActive: boolean;
  onFocus: () => void;
};

export const FlowColumn = React.memo(function FlowColumn({ 
  title, 
  content, 
  onContentChange, 
  shorthandDictionary,
  isActive,
  onFocus
}: FlowColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [isActive]);

  return (
    <Card 
      ref={containerRef}
      className={cn(
        "flex flex-col min-w-[350px] w-1/5 flex-grow transition-all duration-200 border-2",
        isActive 
          ? "border-primary ring-2 ring-primary/20 bg-card shadow-[0_0_15px_rgba(var(--primary),0.1)]" 
          : "bg-card/80 backdrop-blur-sm border-border/50 opacity-80"
      )}
      onClick={onFocus}
    >
      <CardHeader className={cn(
        "flex-row items-center justify-between p-3 border-b transition-colors",
        isActive ? "border-primary/50 bg-primary/5" : "border-border/50"
      )}>
        <CardTitle className={cn(
          "text-lg font-headline transition-colors",
          isActive ? "text-primary" : "text-muted-foreground"
        )}>
          {title}
        </CardTitle>
        {isActive && (
          <span className="text-[10px] uppercase font-bold text-primary animate-pulse">
            Active
          </span>
        )}
      </CardHeader>
      <CardContent className="p-0 flex-grow flex flex-col overflow-hidden">
        <ShorthandEditor
          value={content}
          onValueChange={onContentChange}
          shorthandDictionary={shorthandDictionary}
          isActive={isActive}
        />
      </CardContent>
    </Card>
  );
});
