import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { KanbanColumn } from './KanbanColumn';
import type { Candidate } from '@/lib/db';

const STAGES = [
  { id: 'applied', title: 'Applied', color: 'bg-blue-100 text-blue-800' },
  { id: 'screen', title: 'Screening', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'tech', title: 'Technical', color: 'bg-purple-100 text-purple-800' },
  { id: 'offer', title: 'Offer', color: 'bg-green-100 text-green-800' },
  { id: 'hired', title: 'Hired', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'rejected', title: 'Rejected', color: 'bg-red-100 text-red-800' },
];

const STAGE_COLOR_HEX: Record<string, string> = {
  applied: '#94a3b8',
  screen: '#fbbf24',
  tech: '#7c3aed',
  offer: '#10b981',
  hired: '#10b981',
  rejected: '#ef4444',
};

async function fetchAllCandidates() {
  const response = await fetch('/api/candidates?page=1&pageSize=1000');
  if (!response.ok) throw new Error('Failed to fetch candidates');
  return response.json();
}

export function CandidateKanban() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['candidates-kanban'],
    queryFn: fetchAllCandidates,
  });

  // Local optimistic buckets for snappier UX
  const [buckets, setBuckets] = useState<Record<string, Candidate[]>>(() =>
    STAGES.reduce((acc, s) => ({ ...acc, [s.id]: [] as Candidate[] }), {} as Record<string, Candidate[]>)
  );

  useEffect(() => {
    if (!data?.candidates) return;
    const candidates: Candidate[] = data.candidates;
    const grouped = STAGES.reduce((acc, stage) => {
      acc[stage.id] = candidates.filter((c) => c.stage === stage.id);
      return acc;
    }, {} as Record<string, Candidate[]>);
    setBuckets(grouped);
  }, [data]);

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: string }) => {
      const response = await fetch(`/api/candidates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });
      if (!response.ok) throw new Error('Failed to update stage');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates-kanban'] });
      toast({
        title: 'Success',
        description: 'Candidate stage updated',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update candidate stage',
        variant: 'destructive',
      });
    },
  });

  const candidates = data?.candidates || [];
  const candidatesByStage = buckets;

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const candidateId = active.id as string;
    const newStage = over.id as string;

    // Optimistically move candidate between buckets
    setBuckets((prev) => {
      const next = { ...prev };
      // remove from previous
      for (const k of Object.keys(next)) {
        next[k] = next[k].filter((c) => c.id !== candidateId);
      }
      // find candidate in original data (fallback)
      const candidate = candidates.find((c) => c.id === candidateId);
      if (candidate) {
        const moved = { ...candidate, stage: newStage } as Candidate;
        next[newStage] = [moved, ...(next[newStage] || [])];
      }
      return next;
    });

    updateStageMutation.mutate({ id: candidateId, stage: newStage });
  };

  const activeCandidate = candidates.find((c: Candidate) => c.id === activeId);

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage.id}
            stage={stage}
            candidates={candidatesByStage[stage.id] || []}
            stageColor={STAGE_COLOR_HEX[stage.id]}
          />
        ))}
      </div>

      <DragOverlay>
        {activeCandidate && (
          <Card className="p-3 w-64 bg-card shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-semibold text-sm">
                {activeCandidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div>
                <h4 className="font-medium">{activeCandidate.name}</h4>
                <p className="text-sm text-muted-foreground">{activeCandidate.email}</p>
              </div>
            </div>
          </Card>
        )}
      </DragOverlay>
    </DndContext>
  );
}
