'use client';

import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export type FrameworkSide = {
  value: string;
  valueCriterion: string;
  interpretation: string;
  contentions: string;
  impacts: string;
  sources: string;
  underview: string;
};

type FrameworkEditorProps = {
  side: 'affirmative' | 'negative';
  title: string;
  framework: FrameworkSide;
  onFrameworkChange: (framework: FrameworkSide) => void;
  onLoadTemplate: () => void;
};

function FrameworkEditorComponent({
  side,
  title,
  framework,
  onFrameworkChange,
  onLoadTemplate,
}: FrameworkEditorProps) {
  const [internalFramework, setInternalFramework] = useState(framework);

  useEffect(() => {
    setInternalFramework(framework);
  }, [framework]);

  const handleInputChange = (field: keyof FrameworkSide, value: string) => {
    setInternalFramework(prev => ({ ...prev, [field]: value }));
  };

  const handleBlur = () => {
    onFrameworkChange(internalFramework);
  };

  return (
    <Card className="flex-1" onBlur={handleBlur}>
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${side}-value`} className="text-base">Value</Label>
          <Input id={`${side}-value`} placeholder="e.g., Justice, Morality" value={internalFramework.value} onChange={(e) => handleInputChange('value', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${side}-valueCriterion`} className="text-base">Value Criterion</Label>
          <Input id={`${side}-valueCriterion`} placeholder="e.g., Maximizing Well-being" value={internalFramework.valueCriterion} onChange={(e) => handleInputChange('valueCriterion', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${side}-interpretation`} className="text-base">Interpretation / Rules</Label>
          <Textarea
            id={`${side}-interpretation`}
            placeholder="Define how this framework should be interpreted..."
            value={internalFramework.interpretation}
            onChange={(e) => handleInputChange('interpretation', e.target.value)}
            className="min-h-[100px] font-code"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${side}-contentions`} className="text-base">Contentions</Label>
          <Textarea
            id={`${side}-contentions`}
            placeholder="Build case arguments and responses here..."
            value={internalFramework.contentions}
            onChange={(e) => handleInputChange('contentions', e.target.value)}
            className="min-h-[150px] font-code"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${side}-impacts`} className="text-base">Impacts</Label>
          <Textarea
            id={`${side}-impacts`}
            placeholder="Impact calculus and weighing..."
            value={internalFramework.impacts}
            onChange={(e) => handleInputChange('impacts', e.target.value)}
            className="min-h-[100px] font-code"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${side}-sources`} className="text-base">Sources / Evidence</Label>
          <Textarea
            id={`${side}-sources`}
            placeholder="List your citations and evidence here..."
            value={internalFramework.sources}
            onChange={(e) => handleInputChange('sources', e.target.value)}
            className="min-h-[100px] font-code"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${side}-underview`} className="text-base">Underview / Voters</Label>
          <Textarea
            id={`${side}-underview`}
            placeholder="Summarize voting issues and provide an underview..."
            value={internalFramework.underview}
            onChange={(e) => handleInputChange('underview', e.target.value)}
            className="min-h-[100px] font-code"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={onLoadTemplate} variant="secondary" size="sm">
            <FileText className="mr-2 h-4 w-4" />
            Load Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const FrameworkEditor = React.memo(FrameworkEditorComponent);