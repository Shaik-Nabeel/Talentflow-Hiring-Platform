import { useDraggable } from '@dnd-kit/core';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import type { Candidate } from '@/lib/db';

interface KanbanCardProps {
  candidate: Candidate;
}

interface KanbanCardProps {
  candidate: Candidate;
  stageColor?: string;
}

export function KanbanCard({ candidate, stageColor }: KanbanCardProps) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: candidate.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      onClick={(e) => {
        if (e.detail === 2) {
          navigate(`/candidates/${candidate.id}`);
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm"
          style={{ backgroundColor: stageColor ? `${stageColor}20` : '#e5e7eb' }}
        >
          {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-medium text-sm truncate">{candidate.name}</h4>
            <span className="text-xs text-muted-foreground">{candidate.jobTitle}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">{candidate.email}</p>

          {candidate.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {candidate.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
