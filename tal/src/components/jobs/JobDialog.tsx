import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Job } from '@/lib/db';

interface JobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
}

interface JobFormData {
  title: string;
  description: string;
  tags: string;
}

export function JobDialog({ open, onOpenChange, job }: JobDialogProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<JobFormData>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (job) {
      reset({
        title: job.title,
        description: job.description,
        tags: job.tags.join(', '),
      });
    } else {
      reset({ title: '', description: '', tags: '' });
    }
  }, [job, reset]);

  const mutation = useMutation({
    mutationFn: async (data: JobFormData) => {
      const url = job ? `/api/jobs/${job.id}` : '/api/jobs';
      const method = job ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) throw new Error('Failed to save job');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: 'Success',
        description: `Job ${job ? 'updated' : 'created'} successfully`,
      });
      onOpenChange(false);
      reset();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to save job',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: JobFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{job ? 'Edit Job' : 'Create Job'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="e.g., Senior Frontend Developer"
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Job description..."
              rows={5}
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              {...register('tags')}
              placeholder="e.g., Engineering, Remote, Full-time"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
