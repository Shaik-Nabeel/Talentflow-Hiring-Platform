import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { QuestionEditor } from './QuestionEditor';
import type { AssessmentSection, Question } from '@/lib/db';

interface SectionEditorProps {
  section: AssessmentSection;
  onUpdate: (updates: Partial<AssessmentSection>) => void;
  onDelete: () => void;
}

export function SectionEditor({ section, onUpdate, onDelete }: SectionEditorProps) {
  const [isOpen, setIsOpen] = useState(true);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type: 'text',
      question: 'New Question',
      required: false,
    };
    onUpdate({ questions: [...section.questions, newQuestion] });
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    onUpdate({
      questions: section.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    });
  };

  const deleteQuestion = (id: string) => {
    onUpdate({
      questions: section.questions.filter((q) => q.id !== id),
    });
  };

  return (
    <Card className="p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-2 mb-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <Input
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="flex-1"
          />
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <CollapsibleContent className="space-y-3">
          {section.questions.map((question) => (
            <QuestionEditor
              key={question.id}
              question={question}
              allQuestions={section.questions}
              onUpdate={(updates) => updateQuestion(question.id, updates)}
              onDelete={() => deleteQuestion(question.id)}
            />
          ))}

          <Button onClick={addQuestion} variant="outline" size="sm">
            <Plus className="h-3 w-3 mr-1" />
            Add Question
          </Button>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
