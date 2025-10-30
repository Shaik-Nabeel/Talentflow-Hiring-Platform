import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { JobDialog } from '@/components/jobs/JobDialog';

import * as api from '@/lib/api';

async function fetchJob(id: string) {
  return api.fetchJob(id);
}

async function fetchJobCandidates(jobId: string) {
  return api.fetchCandidates({ page: 1, pageSize: 1000, jobId });
}

export default function JobDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: jobData, isLoading: jobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => fetchJob(jobId!),
    enabled: !!jobId,
  });

  if (jobLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const job = jobData?.job;

  if (!job) {
    return <div className="text-center py-8">Job not found</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/jobs')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Jobs
      </Button>

      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                {job.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{job.slug}</p>
          </div>
          <Button onClick={() => setEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Job
          </Button>
        </div>

        <Separator className="my-6" />

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            {/* Simplified description per user request: show work mode and company line only */}
            <p className="text-muted-foreground">
              {Array.isArray(job.tags) && job.tags.map((t: string) => t.toLowerCase()).includes('remote')
                ? 'Remote'
                : 'On-site / Hybrid'}
              {' • '}Work at Company
            </p>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag: string) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Candidates overview intentionally removed per user request */}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/assessments/${job.id}`)}
            >
              View Assessment
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/candidates?jobId=${job.id}`)}
            >
              View All Candidates
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/candidates?jobId=${job.id}&stage=applied`)}
            >
              View Applicants
            </Button>
          </div>
        </div>
      </Card>

      <JobDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        job={job}
      />
    </div>
  );
}
