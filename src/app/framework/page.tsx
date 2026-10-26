"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Home, Save, Trash2, FolderDown, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FrameworkEditor, type FrameworkSide } from '@/components/framework-editor';

type Framework = {
  name: string;
  affirmative: FrameworkSide;
  negative: FrameworkSide;
};

const initialSideState: FrameworkSide = {
  value: '',
  valueCriterion: '',
  interpretation: '',
  contentions: '',
  impacts: '',
  sources: '',
  underview: '',
};

const frameworkTemplate: FrameworkSide = {
  value: 'Morality',
  valueCriterion: 'Minimizing Suffering',
  interpretation: 'The framework should be evaluated through a utilitarian lens, where the action that leads to the least amount of aggregate suffering is the most moral one. All impacts should be weighed through this lens.',
  contentions: 'Contention 1: [Your first argument here]\n  A. [Sub-point or evidence]\n  B. [Sub-point or evidence]\n\nContention 2: [Your second argument here]\n  A. [Sub-point or evidence]',
  impacts: 'The primary impact is [e.g., loss of life, economic collapse, violation of rights]. This outweighs other impacts because [e.g., scope, magnitude, timeframe].',
  sources: '1. [Author, Year]. "[Title of Source]". [Publication].\n2. [Author, Year]. "[Title of Source]". [Publication].',
  underview: 'Voter 1: [Summarize your most critical voting issue].\nVoter 2: [Summarize your second most critical voting issue].',
};


export default function FrameworkPage() {
  const { toast } = useToast();
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  
  const [affirmativeFramework, setAffirmativeFramework] = useState<FrameworkSide>({...initialSideState});
  const [negativeFramework, setNegativeFramework] = useState<FrameworkSide>({...initialSideState});
  
  const [frameworkName, setFrameworkName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const savedFrameworks = localStorage.getItem('savedFrameworks');
      if (savedFrameworks) {
        setFrameworks(JSON.parse(savedFrameworks));
      }
    } catch (error) {
      console.error("Failed to load frameworks from localStorage", error);
    }
  }, []);

  const handleSaveFramework = () => {
    if (!frameworkName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Invalid Name',
        description: 'Framework name cannot be empty.',
      });
      return;
    }
    const newFramework: Framework = {
      name: frameworkName,
      affirmative: affirmativeFramework,
      negative: negativeFramework
    };
    
    const existingIndex = frameworks.findIndex(f => f.name === frameworkName);
    let newFrameworks: Framework[];
    if (existingIndex > -1) {
        newFrameworks = [...frameworks];
        newFrameworks[existingIndex] = newFramework;
    } else {
        newFrameworks = [...frameworks, newFramework];
    }

    setFrameworks(newFrameworks);
    try {
      localStorage.setItem('savedFrameworks', JSON.stringify(newFrameworks));
      toast({
        title: 'Framework Saved',
        description: `Your framework "${frameworkName}" has been saved.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save the framework to local storage.',
      });
    }
  };

  const handleLoadFramework = (frameworkToLoad: Framework) => {
    setFrameworkName(frameworkToLoad.name);
    setAffirmativeFramework({ ...initialSideState, ...frameworkToLoad.affirmative });
    setNegativeFramework({ ...initialSideState, ...frameworkToLoad.negative });
    toast({
      title: 'Framework Loaded',
      description: `Framework "${frameworkToLoad.name}" has been loaded.`,
    });
  };

  const handleDeleteFramework = (frameworkToDelete: Framework) => {
    const newFrameworks = frameworks.filter(f => f.name !== frameworkToDelete.name);
    setFrameworks(newFrameworks);
    try {
      localStorage.setItem('savedFrameworks', JSON.stringify(newFrameworks));
      toast({
        title: 'Framework Deleted',
        description: `Framework "${frameworkToDelete.name}" has been deleted.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: 'Could not delete the framework from local storage.',
      });
    }
  };

  const handleExportFrameworks = () => {
    if (frameworks.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Frameworks to Export',
        description: 'You must save at least one framework before exporting.',
      });
      return;
    }
    const frameworksString = JSON.stringify(frameworks, null, 2);
    const blob = new Blob([frameworksString], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ld_frameworks.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFrameworks = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rawImported = JSON.parse(text);
        
        let frameworksToProcess: any[] = [];
        if (Array.isArray(rawImported)) {
          frameworksToProcess = rawImported;
        } else if (typeof rawImported === 'object' && rawImported !== null) {
          frameworksToProcess = [rawImported]; // Handle single object import
        } else {
           throw new Error('Invalid file content. Expected a JSON object or an array of objects.');
        }

        const formatObjectToString = (obj: any): string => {
          if (typeof obj === 'string') return obj;
          if (typeof obj === 'object' && obj !== null) {
            return Object.entries(obj)
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n');
          }
          return '';
        };

        const importedFrameworks: Framework[] = frameworksToProcess.map(fw => {
            if (!fw.name || typeof fw.name !== 'string' || !fw.affirmative || !fw.negative) {
                console.warn('Skipping invalid framework object on import:', fw);
                return null;
            }
            
            const sanitizeSide = (side: any): FrameworkSide => {
              return {
                  ...initialSideState,
                  ...side,
                  contentions: formatObjectToString(side.contentions),
                  impacts: formatObjectToString(side.impacts),
                  sources: formatObjectToString(side.sources),
              };
            };

            const sanitizedAff = sanitizeSide(fw.affirmative);
            const sanitizedNeg = sanitizeSide(fw.negative);

            return {
                name: fw.name,
                affirmative: sanitizedAff,
                negative: sanitizedNeg,
            };
        }).filter((fw): fw is Framework => fw !== null);

        if (importedFrameworks.length === 0 && frameworksToProcess.length > 0) {
             throw new Error('No valid frameworks found in the file.');
        }

        // Merge with existing frameworks, overwriting duplicates
        const updatedFrameworks = [...frameworks];
        importedFrameworks.forEach(importedFw => {
            const existingIndex = updatedFrameworks.findIndex(fw => fw.name === importedFw.name);
            if (existingIndex > -1) {
                updatedFrameworks[existingIndex] = importedFw;
            } else {
                updatedFrameworks.push(importedFw);
            }
        });
        
        setFrameworks(updatedFrameworks);
        localStorage.setItem('savedFrameworks', JSON.stringify(updatedFrameworks));
        toast({
          title: 'Import Successful',
          description: `${importedFrameworks.length} framework(s) were imported or updated.`,
        });
      } catch (err) {
        const error = err as Error;
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: error.message || 'The selected file is not a valid framework file.',
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleLoadTemplate = (side: 'affirmative' | 'negative') => {
    if (side === 'affirmative') {
      setAffirmativeFramework(frameworkTemplate);
    } else {
      setNegativeFramework(frameworkTemplate);
    }
  };


  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <header className="flex items-center justify-between p-2 border-b border-border shadow-md shrink-0">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold font-headline text-foreground">
            Framework Builder
          </h1>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm">
            <Home className="mr-2 h-4 w-4" />
            Back to Flow
          </Button>
        </Link>
      </header>

      <main className="flex-grow flex flex-col p-4 gap-4 overflow-y-auto">
        <div className="flex flex-col md:flex-row items-start gap-4">
            <Card className="w-full md:w-1/3">
                <CardHeader>
                    <CardTitle className="text-2xl font-headline text-primary">Manage Frameworks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="framework-name" className="text-base">Framework Name</Label>
                        <Input id="framework-name" placeholder="e.g., Econ DA, Human Rights Aff" value={frameworkName} onChange={(e) => setFrameworkName(e.target.value)} />
                    </div>
                     <div className="flex flex-wrap gap-2 justify-end">
                        <Button onClick={handleSaveFramework} size="sm">
                            <Save className="mr-2 h-4 w-4" /> Save
                        </Button>
                        <Button variant="outline" onClick={handleExportFrameworks} size="sm">
                            <Download className="mr-2 h-4 w-4" /> Export All
                        </Button>
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()} size="sm">
                            <Upload className="mr-2 h-4 w-4" /> Import
                        </Button>
                        <input type="file" ref={fileInputRef} onChange={handleImportFrameworks} accept=".json" className="hidden" />
                    </div>
                    <hr className="border-border" />
                    {frameworks.length === 0 ? (
                        <p className="text-muted-foreground text-center pt-4">No frameworks saved yet.</p>
                    ) : (
                        <div className="space-y-2 pt-4">
                        <h3 className="text-lg font-semibold mb-2">Saved Frameworks</h3>
                        <ScrollArea className="h-64">
                          {frameworks.map((fw, index) => (
                             <div key={index} className="flex justify-between items-center p-2 border rounded-md mb-2">
                                <span className="font-medium truncate pr-2">{fw.name}</span>
                                <div className="flex gap-1 shrink-0">
                                     <Button size="sm" variant="outline" onClick={() => handleLoadFramework(fw)}>
                                        <FolderDown className="h-4 w-4"/>
                                     </Button>
                                     <Button size="sm" variant="destructive" onClick={() => handleDeleteFramework(fw)}>
                                        <Trash2 className="h-4 w-4"/>
                                     </Button>
                                </div>
                             </div>
                          ))}
                        </ScrollArea>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="w-full flex flex-col md:flex-row gap-4">
                 <FrameworkEditor 
                    side="affirmative"
                    title="Affirmative Framework"
                    framework={affirmativeFramework}
                    onFrameworkChange={setAffirmativeFramework}
                    onLoadTemplate={() => handleLoadTemplate('affirmative')}
                />
                <FrameworkEditor 
                    side="negative"
                    title="Negative Framework"
                    framework={negativeFramework}
                    onFrameworkChange={setNegativeFramework}
                    onLoadTemplate={() => handleLoadTemplate('negative')}
                />
            </div>
        </div>
      </main>
    </div>
  );
}