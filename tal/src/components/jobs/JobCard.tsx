import { GripVertical, Edit, Archive, ArchiveRestore } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Job } from '@/lib/db';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onToggleArchive: (job: Job) => void;
}

export function JobCard({ job, onEdit, onToggleArchive }: JobCardProps) {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: job.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-4">
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>

        <div 
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => navigate(`/jobs/${job.id}`)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                {job.title}
              </h3>
              {/* Show a short, consistent one-line description instead of the long paragraph */}
              <p className="text-sm text-muted-foreground mt-1">
                {Array.isArray(job.tags) && job.tags.map((t: string) => t.toLowerCase()).includes('remote')
                  ? 'Remote'
                  : 'On-site / Hybrid'}
                {' • '}Work at Company
              </p>
            </div>
            <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
              {job.status}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {job.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(job);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onToggleArchive(job);
            }}
          >
            {job.status === 'active' ? (
              <Archive className="h-4 w-4" />
            ) : (
              <ArchiveRestore className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
