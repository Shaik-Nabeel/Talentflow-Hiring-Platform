import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import type { AssessmentSection, Question } from '@/lib/db';

interface AssessmentPreviewProps {
  title: string;
  sections: AssessmentSection[];
}

export function AssessmentPreview({ title, sections }: AssessmentPreviewProps) {
  const [responses, setResponses] = useState<Record<string, any>>({});

  const updateResponse = (questionId: string, value: any) => {
    setResponses({ ...responses, [questionId]: value });
  };

  const shouldShowQuestion = (question: Question) => {
    if (!question.conditionalLogic) return true;
    const { dependsOn, expectedValue } = question.conditionalLogic;
    return responses[dependsOn] === expectedValue;
  };

  const renderQuestion = (question: Question) => {
    if (!shouldShowQuestion(question)) return null;

    const baseProps = {
      id: question.id,
      className: 'mt-2',
    };

    switch (question.type) {
      case 'text':
        return (
          <Input
            {...baseProps}
            type="text"
            placeholder="Your answer"
            value={responses[question.id] || ''}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            maxLength={question.maxLength}
          />
        );

      case 'longtext':
        return (
          <Textarea
            {...baseProps}
            placeholder="Your answer"
            value={responses[question.id] || ''}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            maxLength={question.maxLength}
            rows={4}
          />
        );

      case 'numeric':
        return (
          <Input
            {...baseProps}
            type="number"
            placeholder="Your answer"
            value={responses[question.id] || ''}
            onChange={(e) => updateResponse(question.id, Number(e.target.value))}
            min={question.minValue}
            max={question.maxValue}
          />
        );

      case 'single':
        return (
          <RadioGroup
            value={responses[question.id] || ''}
            onValueChange={(value) => updateResponse(question.id, value)}
            className="mt-2"
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'multi':
        return (
          <div className="space-y-2 mt-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={(responses[question.id] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const current = responses[question.id] || [];
                    const updated = checked
                      ? [...current, option]
                      : current.filter((v: string) => v !== option);
                    updateResponse(question.id, updated);
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'file':
        return (
          <Input {...baseProps} type="file" onChange={(e) => updateResponse(question.id, e.target.files)} />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-h-[600px] overflow-y-auto">
      {title && <h3 className="text-2xl font-bold">{title}</h3>}

      {sections.map((section) => (
        <Card key={section.id} className="p-4">
          <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
          <div className="space-y-4">
            {section.questions.map((question) => {
              if (!shouldShowQuestion(question)) return null;
              return (
                <div key={question.id}>
                  <Label>
                    {question.question}
                    {question.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {renderQuestion(question)}
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      <Button className="w-full">Submit Assessment</Button>
    </div>
  );
}
