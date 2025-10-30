import { useDroppable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KanbanCard } from './KanbanCard';
import type { Candidate } from '@/lib/db';

interface KanbanColumnProps {
  stage: {
    id: string;
    title: string;
    color: string;
  };
  candidates: Candidate[];
  stageColor?: string;
}

export function KanbanColumn({ stage, candidates, stageColor }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-8 rounded-full"
              style={{ backgroundColor: stageColor || undefined }}
            />
            <h3 className="font-semibold">{stage.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{candidates.length}</span>
          </div>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[400px] rounded-lg p-2 space-y-2 transition-colors ${
          isOver ? 'ring-2 ring-offset-1 ring-primary/40 bg-primary/5' : 'bg-transparent'
        }`}
      >
        {candidates.map((candidate) => (
          <KanbanCard key={candidate.id} candidate={candidate} stageColor={stageColor} />
        ))}
      </div>
    </div>
  );
}
