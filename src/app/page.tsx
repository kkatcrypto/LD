"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Download,
  FileText,
  Settings,
  Save,
  Trash2,
  Plus,
  Upload,
  Book,
  FolderDown,
  Scaling,
  Eraser,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/icons';
import { FlowColumn } from '@/components/flow-column';
import { DebateTimer } from '@/components/debate-timer';
import { defaultShorthandDictionary } from '@/lib/shorthand';
import { Label } from '@/components/ui/label';

type SpeechColumn = 'AC' | 'NC/NR' | '1AR' | '2NR' | '2AR';
const speechColumns: SpeechColumn[] = ['AC', 'NC/NR', '1AR', '2NR', '2AR'];

type Case = { name: string; flows: Record<SpeechColumn, string> };

export default function Home() {
  const { toast } = useToast();
  const [flows, setFlows] = useState<Record<SpeechColumn, string>>(
    speechColumns.reduce((acc, col) => ({ ...acc, [col]: '' }), {} as Record<SpeechColumn, string>)
  );
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);

  const [isShorthandDialogOpen, setShorthandDialogOpen] = useState(false);
  const [shorthandDict, setShorthandDict] = useState<Map<string, string>>(new Map());
  const [editedDict, setEditedDict] = useState<[string, string][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaveCaseDialogOpen, setSaveCaseDialogOpen] = useState(false);
  const [caseName, setCaseName] = useState('');
  const [savedCases, setSavedCases] = useState<Case[]>([]);

  useEffect(() => {
    try {
      const savedDict = localStorage.getItem('shorthandDictionary');
      if (savedDict) {
        setShorthandDict(new Map(JSON.parse(savedDict)));
      } else {
        setShorthandDict(defaultShorthandDictionary);
      }
      const casesFromStorage = localStorage.getItem('savedCases');
      if (casesFromStorage) {
        setSavedCases(JSON.parse(casesFromStorage));
      }
    } catch (error) {
      console.error("Failed to load from localStorage", error);
      setShorthandDict(defaultShorthandDictionary);
      setSavedCases([]);
    }
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.altKey && e.key >= '1' && e.key <= '5') {
      const index = parseInt(e.key) - 1;
      setActiveColumnIndex(index);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleFlowChange = (title: SpeechColumn, content: string) => {
    setFlows((prev) => ({ ...prev, [title]: content }));
  };

  const resetFlow = () => {
    setFlows(speechColumns.reduce((acc, col) => ({ ...acc, [col]: '' }), {} as Record<SpeechColumn, string>));
    setActiveColumnIndex(0);
    toast({
      title: 'Flow Reset',
      description: 'The flow board has been cleared.',
    });
  };

  const handleExport = (format: 'txt' | 'md') => {
    let content = '';
    let fileExt = format;

    if (format === 'txt') {
      content = speechColumns
        .map(col => `--- ${col} ---\n\n${flows[col]}`)
        .join('\n\n\n');
    } else if (format === 'md') {
       content = speechColumns
        .map(col => `## ${col}\n\n${flows[col]}`)
        .join('\n\n');
    }

    const blob = new Blob([content], { type: `text/${fileExt};charset=utf-8;` });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ld_flow.${fileExt}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openShorthandDialog = () => {
    setEditedDict(Array.from(shorthandDict.entries()));
    setShorthandDialogOpen(true);
  };
  
  const handleDictChange = (index: number, key: string, value: string) => {
    const newDict = [...editedDict];
    newDict[index] = [key, value];
    setEditedDict(newDict);
  };
  
  const addDictRow = () => {
    setEditedDict([...editedDict, ['', '']]);
  };
  
  const removeDictRow = (index: number) => {
    const newDict = [...editedDict];
    newDict.splice(index, 1);
    setEditedDict(newDict);
  };

  const saveShorthandDict = () => {
    const newMap = new Map(editedDict.filter(([key]) => key.trim() !== ''));
    setShorthandDict(newMap);
    try {
      localStorage.setItem('shorthandDictionary', JSON.stringify(Array.from(newMap.entries())));
      toast({
        title: 'Dictionary Saved',
        description: 'Your shorthand dictionary has been updated.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the dictionary to local storage.',
      });
    }
    setShorthandDialogOpen(false);
  };

  const handleExportDict = () => {
    const dictString = JSON.stringify(Array.from(shorthandDict.entries()), null, 2);
    const blob = new Blob([dictString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'shorthand_dictionary.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportDict = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        if (!Array.isArray(data)) throw new Error('Invalid format');
        
        const newMap = new Map(data as [string, string][]);
        setEditedDict(Array.from(newMap.entries()));
        toast({
          title: 'Dictionary Imported',
          description: 'Review the changes and save.',
        });
      } catch (err) {
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: 'The selected file is not a valid dictionary file.',
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveCase = () => {
    if (!caseName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Invalid Name',
        description: 'Case name cannot be empty.',
      });
      return;
    }
    const newCase: Case = { name: caseName, flows };
    const newCases = [...savedCases, newCase];
    setSavedCases(newCases);
    try {
      localStorage.setItem('savedCases', JSON.stringify(newCases));
      toast({
        title: 'Case Saved',
        description: `Your case "${caseName}" has been saved.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the case to local storage.',
      });
    }
    setSaveCaseDialogOpen(false);
    setCaseName('');
  };

  const handleLoadCase = (caseToLoad: Case) => {
    setFlows(caseToLoad.flows);
    toast({
      title: 'Case Loaded',
      description: `Case "${caseToLoad.name}" has been loaded.`,
    });
  };

  const handleDeleteCase = (caseToDelete: Case) => {
    const newCases = savedCases.filter(c => c.name !== caseToDelete.name);
    setSavedCases(newCases);
    try {
      localStorage.setItem('savedCases', JSON.stringify(newCases));
      toast({
        title: 'Case Deleted',
        description: `Case "${caseToDelete.name}" has been deleted.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Could not delete the case from local storage.',
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body select-none">
      <header className="flex items-center justify-between p-2 border-b border-border shadow-md shrink-0 bg-card/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold font-headline text-foreground tracking-tight">
              LD Flow
            </h1>
          </div>
          
          <DebateTimer />
        </div>

        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive transition-colors">
                <Eraser className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear the flow?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently clear all speech columns for the current round.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetFlow} className="bg-destructive text-destructive-foreground">Clear All</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

           <Link href="/framework">
            <Button variant="outline" size="sm">
              <Scaling className="h-4 w-4 mr-2" />
              Frameworks
            </Button>
          </Link>
          
          <div className="h-6 border-l border-border mx-1" />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSaveCaseDialogOpen(true)}
          >
            <Book className="h-4 w-4 mr-2" />
            Save
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={savedCases.length === 0}>
                <FolderDown className="h-4 w-4 mr-2" />
                Load
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {savedCases.map((c, i) => (
                <DropdownMenuItem key={i} className="flex justify-between items-center" onSelect={(e) => e.preventDefault()}>
                  <span onClick={() => handleLoadCase(c)} className="flex-grow cursor-pointer truncate mr-2">{c.name}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleDeleteCase(c)}>
                    <Trash2 className="text-destructive h-3 w-3"/>
                  </Button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="h-6 border-l border-border mx-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('txt')}>
                <FileText className="mr-2 h-4 w-4" />
                Plain Text (.txt)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('md')}>
                 <FileText className="mr-2 h-4 w-4" />
                Markdown (.md)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={openShorthandDialog} className="h-9 w-9">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Shorthand Settings</span>
          </Button>
        </div>
      </header>

      <main className="flex-grow flex p-3 gap-3 overflow-x-auto bg-[#0a0a0a] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {speechColumns.map((title, index) => (
          <FlowColumn
            key={title}
            title={title}
            content={flows[title]}
            shorthandDictionary={shorthandDict}
            onContentChange={(content) => handleFlowChange(title, content)}
            isActive={activeColumnIndex === index}
            onFocus={() => setActiveColumnIndex(index)}
          />
        ))}
      </main>

      <footer className="h-8 border-t border-border px-4 flex items-center justify-between text-[10px] text-muted-foreground bg-card/30 shrink-0">
        <div className="flex gap-4">
          <span><kbd className="px-1 rounded bg-muted">Alt+1-5</kbd> Switch Column</span>
          <span><kbd className="px-1 rounded bg-muted">Space</kbd> Expand Shorthand</span>
        </div>
        <div>
          Lincoln-Douglas Debate Flow Tool
        </div>
      </footer>

      {/* Shorthand Dictionary Dialog */}
      <Dialog open={isShorthandDialogOpen} onOpenChange={setShorthandDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">Shorthand Dictionary</DialogTitle>
            <DialogDescription>
              Create custom abbreviations. Type the shorthand followed by a space in the editor to expand.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh] pr-4">
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_2fr_auto] items-center gap-3 pr-2 mb-2">
                <div className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Shorthand</div>
                <div className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Expansion</div>
                <div />
              </div>
              {editedDict.map(([key, value], index) => (
                <div key={index} className="grid grid-cols-[1fr_2fr_auto] items-center gap-3">
                  <Input
                    value={key}
                    onChange={(e) => handleDictChange(index, e.target.value, value)}
                    className="font-code text-sm h-9"
                    placeholder="e.g. V"
                  />
                  <Input
                    value={value}
                    onChange={(e) => handleDictChange(index, key, e.target.value)}
                    className="font-code text-sm h-9"
                    placeholder="e.g. Value"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeDictRow(index)} className="h-9 w-9 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4 sm:justify-between gap-4">
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportDict}><Download className="mr-2 h-4 w-4" /> Export</Button>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Import</Button>
                <input type="file" ref={fileInputRef} onChange={handleImportDict} accept=".json" className="hidden" />
            </div>
            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={addDictRow}>
                <Plus className="mr-2 h-4 w-4" /> Add Row
                </Button>
                <Button size="sm" onClick={saveShorthandDict}>
                <Save className="mr-2 h-4 w-4" /> Save Dictionary
                </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

       {/* Save Case Dialog */}
      <Dialog open={isSaveCaseDialogOpen} onOpenChange={setSaveCaseDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl text-primary">Save Round Case</DialogTitle>
            <DialogDescription>
              Archive the current flow to local storage.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="case-name" className="text-sm font-medium">
                Round/Case Name
              </Label>
              <Input
                id="case-name"
                value={caseName}
                onChange={(e) => setCaseName(e.target.value)}
                placeholder="e.g., Finals vs St. Marks"
                className="font-body"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveCaseDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCase}><Save className="mr-2 h-4 w-4" /> Save Round</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
