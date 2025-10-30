import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import type { Question } from '@/lib/db';

interface QuestionEditorProps {
  question: Question;
  allQuestions: Question[];
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
}

const QUESTION_TYPES = [
  { value: 'single', label: 'Single Choice' },
  { value: 'multi', label: 'Multiple Choice' },
  { value: 'text', label: 'Short Text' },
  { value: 'longtext', label: 'Long Text' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'file', label: 'File Upload' },
];

export function QuestionEditor({ question, allQuestions, onUpdate, onDelete }: QuestionEditorProps) {
  return (
    <Card className="p-3 bg-muted/30">
      <div className="flex gap-2 mb-2">
        <Input
          value={question.question}
          onChange={(e) => onUpdate({ question: e.target.value })}
          placeholder="Question text"
          className="flex-1"
        />
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <Label className="text-xs">Type</Label>
          <select
            value={question.type}
            onChange={(e) => onUpdate({ type: e.target.value as Question['type'] })}
            className="w-full px-2 py-1 text-sm border rounded"
          >
            {QUESTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id={`required-${question.id}`}
            checked={question.required}
            onCheckedChange={(checked) => onUpdate({ required: !!checked })}
          />
          <Label htmlFor={`required-${question.id}`} className="text-xs">
            Required
          </Label>
        </div>
      </div>

      {(question.type === 'single' || question.type === 'multi') && (
        <div>
          <Label className="text-xs">Options (comma-separated)</Label>
          <Input
            value={question.options?.join(', ') || ''}
            onChange={(e) =>
              onUpdate({ options: e.target.value.split(',').map((o) => o.trim()) })
            }
            placeholder="Option 1, Option 2, Option 3"
            className="text-sm"
          />
        </div>
      )}

      {question.type === 'numeric' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">Min Value</Label>
            <Input
              type="number"
              value={question.minValue || ''}
              onChange={(e) => onUpdate({ minValue: Number(e.target.value) })}
              className="text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Max Value</Label>
            <Input
              type="number"
              value={question.maxValue || ''}
              onChange={(e) => onUpdate({ maxValue: Number(e.target.value) })}
              className="text-sm"
            />
          </div>
        </div>
      )}

      {(question.type === 'text' || question.type === 'longtext') && (
        <div>
          <Label className="text-xs">Max Length</Label>
          <Input
            type="number"
            value={question.maxLength || ''}
            onChange={(e) => onUpdate({ maxLength: Number(e.target.value) })}
            className="text-sm"
          />
        </div>
      )}

      <div className="mt-2">
        <Label className="text-xs">Conditional Logic</Label>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={question.conditionalLogic?.dependsOn || ''}
            onChange={(e) =>
              onUpdate({
                conditionalLogic: e.target.value
                  ? { dependsOn: e.target.value, expectedValue: '' }
                  : undefined,
              })
            }
            className="w-full px-2 py-1 text-sm border rounded"
          >
            <option value="">No dependency</option>
            {allQuestions
              .filter((q) => q.id !== question.id)
              .map((q) => (
                <option key={q.id} value={q.id}>
                  {q.question}
                </option>
              ))}
          </select>

          {question.conditionalLogic?.dependsOn && (
            <Input
              placeholder="Expected value"
              value={question.conditionalLogic.expectedValue}
              onChange={(e) =>
                onUpdate({
                  conditionalLogic: {
                    ...question.conditionalLogic!,
                    expectedValue: e.target.value,
                  },
                })
              }
              className="text-sm"
            />
          )}
        </div>
      </div>
    </Card>
  );
}
