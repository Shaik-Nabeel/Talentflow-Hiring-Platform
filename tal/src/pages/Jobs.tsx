import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Archive, ArchiveRestore } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db';
import * as api from '@/lib/api';
import { JobDialog } from '@/components/jobs/JobDialog';
import { JobList } from '@/components/jobs/JobList';
import type { Job } from '@/lib/db';

async function fetchJobs(page: number, search: string, status: string, sort: string) {
  return api.fetchJobs({ page, pageSize: 10, search, status, sort });
}

export default function Jobs() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  // Get initial status from URL search params if present
  const [status, setStatus] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('status') || '';
  });
  const [sort, setSort] = useState('order');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', page, search, status, sort],
    queryFn: () => fetchJobs(page, search, status, sort),
  });

  const toggleArchiveMutation = useMutation({
    mutationFn: async (job: Job) => {
      return api.patchJob(job.id, { status: job.status === 'active' ? 'archived' : 'active' });
    },
    onSuccess: (data) => {
      // Ensure local Dexie DB reflects the updated job so components using useLiveQuery
      // (like the Dashboard) update immediately.
      if (data && data.job) {
        try {
          db.jobs.put(data.job);
        } catch (e) {
          // ignore
        }
      }
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: 'Success',
        description: 'Job status updated successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update job status',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingJob(null);
  };

  // Update status when URL changes
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1); // Reset page to 1 when filter changes
    
    // Update URL params
    const params = new URLSearchParams(window.location.search);
    if (newStatus) {
      params.set('status', newStatus.toLowerCase()); // Ensure status is lowercase
    } else {
      params.delete('status');
    }
    // Update URL without reloading the page
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
    
    // Invalidate the query to force a refresh
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Manage your job postings and track applications
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Job
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg"
          />
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="order">Order</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
          </select>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <>
            <JobList
              jobs={data?.jobs || []}
              onEdit={handleEdit}
              onToggleArchive={(job) => toggleArchiveMutation.mutate(job)}
            />

            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data?.total || 0)} of {data?.total || 0}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={!data || page * 10 >= data.total}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      <JobDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        job={editingJob}
      />
    </div>
  );
}
