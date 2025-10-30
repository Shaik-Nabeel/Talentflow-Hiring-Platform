import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { AssessmentBuilder } from '@/components/assessments/AssessmentBuilder';
import { Button } from '@/components/ui/button';

async function fetchJobs() {
  const response = await fetch('/api/jobs?page=1&pageSize=100&status=active');
  if (!response.ok) throw new Error('Failed to fetch jobs');
  return response.json();
}

async function fetchAssessments() {
  const response = await fetch('/api/assessments');
  if (!response.ok) throw new Error('Failed to fetch assessments');
  return response.json();
}

export default function Assessments() {
  const { jobId } = useParams<{ jobId?: string }>();
  const navigate = useNavigate();

  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs-assessments'],
    queryFn: fetchJobs,
  });

  const { data: assessmentsData, isLoading: assessmentsLoading } = useQuery({
    queryKey: ['assessments-list'],
    queryFn: fetchAssessments,
  });

  const [showOnlyWithAssessments, setShowOnlyWithAssessments] = useState(false);

  const jobs = jobsData?.jobs || [];
  const assessments = assessmentsData?.assessments || [];

  // Redirect to first job once jobs are loaded (don't block rendering while loading)
  useEffect(() => {
    if (!jobId && jobs.length > 0) {
      navigate(`/assessments/${jobs[0].id}`, { replace: true });
    }
  }, [jobId, jobs, navigate]);

  // Count only assessments that belong to active jobs
  const activeAssessmentsCount = assessments.filter((a: any) => {
    const job = jobs.find((j: any) => j.id === a.jobId);
    return job?.status === 'active';
  }).length;

  // If no jobId in URL, navigate to first active job
  if (!jobId && jobs.length > 0) {
    navigate(`/assessments/${jobs[0].id}`, { replace: true });
    return null;
  }

  if (!jobs.length) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No active jobs found. Create a job first.</p>
      </Card>
    );
  }

  const assessmentByJob = new Map(assessments.map((a: any) => [a.jobId, a]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assessment Builder</h1>
        <p className="text-muted-foreground mt-1">Create and preview candidate assessments</p>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 cursor-pointer" onClick={() => setShowOnlyWithAssessments(false)}>
          <p className="text-sm text-muted-foreground">Jobs</p>
          <h3 className="text-2xl font-bold">{jobs.length}</h3>
          <p className="text-xs text-muted-foreground">Active jobs</p>
        </Card>
        <Card className="p-4 cursor-pointer" onClick={() => setShowOnlyWithAssessments(true)}>
          <p className="text-sm text-muted-foreground">Active Assessments</p>
          <h3 className="text-2xl font-bold">{activeAssessmentsCount}</h3>
          <p className="text-xs text-muted-foreground">Click to show only jobs with assessments</p>
        </Card>
        <div />
        <div />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Jobs + assessment state */}
        <div className="col-span-1">
          <Card className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Active Jobs</h3>
              <Button size="sm" variant="outline" onClick={() => navigate(`/assessments/${jobs[0].id}`)}>
                New
              </Button>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto mt-2">
              {jobs
                .filter((job: any) => (showOnlyWithAssessments ? assessments.some((a: any) => a.jobId === job.id) : true))
                .map((job: any) => (
                <div key={job.id} className="flex items-center justify-between p-2 rounded hover:bg-accent/50">
                  <div>
                    <button
                      className={`text-left w-full ${job.id === jobId ? 'font-semibold text-primary' : 'text-muted-foreground'}`}
                      onClick={() => navigate(`/assessments/${job.id}`)}
                    >
                      {job.title}
                    </button>
                    <div className="text-xs text-muted-foreground">{assessmentByJob.has(job.id) ? 'Has assessment' : 'No assessment'}</div>
                  </div>
                  <div>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/assessments/${job.id}`)}>
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Main: Builder */}
        <div className="col-span-3">
          <AssessmentBuilder jobId={jobId!} />
        </div>
      </div>
    </div>
  );
}
