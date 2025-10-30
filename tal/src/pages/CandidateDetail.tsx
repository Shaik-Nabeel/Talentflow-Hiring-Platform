import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import * as api from '@/lib/api';

async function fetchCandidate(id: string) {
  return api.fetchCandidate(id);
}

async function fetchTimeline(id: string) {
  return api.fetchTimeline(id);
}

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: candidateData, isLoading: candidateLoading } = useQuery({
    queryKey: ['candidate', id],
    queryFn: () => fetchCandidate(id!),
    enabled: !!id,
  });

  const { data: timelineData, isLoading: timelineLoading } = useQuery({
    queryKey: ['timeline', id],
    queryFn: () => fetchTimeline(id!),
    enabled: !!id,
  });

  if (candidateLoading || timelineLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  const candidate = candidateData?.candidate;
  const timeline = timelineData?.timeline || [];

  if (!candidate) {
    return <div className="text-center py-8">Candidate not found</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/candidates')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Candidates
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold">{candidate.name}</h1>
                <p className="text-muted-foreground mt-1">{candidate.email}</p>
                <p className="text-muted-foreground">{candidate.phone}</p>
              </div>
              <Badge className="text-lg px-4 py-2">{candidate.stage}</Badge>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {candidate.notes || 'No notes available'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Timeline</h3>
          <div className="space-y-4">
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">No timeline events yet</p>
            ) : (
              timeline.map((event: any) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {event.fromStage} → {event.toStage}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                    {event.note && (
                      <p className="text-sm text-muted-foreground mt-1">{event.note}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
