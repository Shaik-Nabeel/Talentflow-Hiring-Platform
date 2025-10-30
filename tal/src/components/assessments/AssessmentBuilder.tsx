import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { SectionEditor } from './SectionEditor';
import * as api from '@/lib/api';
import { AssessmentPreview } from './AssessmentPreview';
import type { Assessment, AssessmentSection } from '@/lib/db';

interface AssessmentBuilderProps {
  jobId: string;
}

async function fetchAssessment(jobId: string) {
  return api.fetchAssessmentByJob(jobId);
}

export function AssessmentBuilder({ jobId }: AssessmentBuilderProps) {
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<AssessmentSection[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['assessment', jobId],
    queryFn: () => fetchAssessment(jobId),
  });

  useEffect(() => {
    if (data?.assessment) {
      setTitle(data.assessment.title);
      setSections(data.assessment.sections);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return api.saveAssessment(jobId, { title, sections });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment', jobId] });
      // Refresh assessments list so it's live in the UI
      queryClient.invalidateQueries({ queryKey: ['assessments-list'] });
      toast({
        title: 'Success',
        description: 'Assessment saved successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save assessment',
        variant: 'destructive',
      });
    },
  });

  const addSection = () => {
    const newSection: AssessmentSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      questions: [],
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id: string, updates: Partial<AssessmentSection>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Builder</h2>
          <Input
            placeholder="Assessment Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-4"
          />

          <div className="space-y-4">
            {sections.map((section) => (
              <SectionEditor
                key={section.id}
                section={section}
                onUpdate={(updates) => updateSection(section.id, updates)}
                onDelete={() => deleteSection(section.id)}
              />
            ))}
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={addSection} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save Assessment'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Preview</h2>
        <AssessmentPreview title={title} sections={sections} />
      </Card>
    </div>
  );
}
