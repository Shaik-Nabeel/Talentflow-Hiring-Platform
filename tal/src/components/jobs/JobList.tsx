import { useState } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { JobCard } from './JobCard';
import type { Job } from '@/lib/db';

interface JobListProps {
  jobs: Job[];
  onEdit: (job: Job) => void;
  onToggleArchive: (job: Job) => void;
}

export function JobList({ jobs, onEdit, onToggleArchive }: JobListProps) {
  const [optimisticJobs, setOptimisticJobs] = useState<Job[]>(jobs);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const reorderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const response = await fetch(`/api/jobs/${id}/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newOrder }),
      });
      if (!response.ok) throw new Error('Failed to reorder');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: 'Success',
        description: 'Job order updated',
      });
    },
    onError: () => {
      setOptimisticJobs(jobs);
      toast({
        title: 'Error',
        description: 'Failed to reorder jobs',
        variant: 'destructive',
      });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = optimisticJobs.findIndex((j) => j.id === active.id);
    const newIndex = optimisticJobs.findIndex((j) => j.id === over.id);

    const newJobs = [...optimisticJobs];
    const [movedJob] = newJobs.splice(oldIndex, 1);
    newJobs.splice(newIndex, 0, movedJob);

    setOptimisticJobs(newJobs);
    reorderMutation.mutate({ id: String(active.id), newOrder: newIndex });
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={optimisticJobs.map((j) => j.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {optimisticJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={onEdit}
              onToggleArchive={onToggleArchive}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
