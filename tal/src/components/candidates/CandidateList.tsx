import { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate, Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { db, type Candidate } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STAGES = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

const STAGE_COLORS = {
  applied: 'bg-slate-500/20 text-slate-700 dark:text-slate-300',
  screen: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
  tech: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
  offer: 'bg-violet-500/20 text-violet-700 dark:text-violet-300',
  hired: 'bg-green-500/20 text-green-700 dark:text-green-300',
  rejected: 'bg-red-500/20 text-red-700 dark:text-red-300',
};

type EnrichedCandidate = Candidate & { jobTitle: string; jobSlug: string };

export function CandidateList() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Read URL params for jobId and stage pre-filling
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stage = params.get('stage') || '';
    const jobId = params.get('jobId') || '';
    if (stage) setStageFilter(stage);
    // If a jobId param is present, also set the search to empty so filtering works properly
    // we keep jobId handling inside the enrichedCandidates filter below
  }, [location.search]);

  const candidates = useLiveQuery(() => db.candidates.toArray(), []);
  const jobs = useLiveQuery(() => db.jobs.toArray(), []);

  const enrichedCandidates = useMemo(() => {
    if (!candidates || !jobs) return [];

    const jobsMap = new Map(jobs.map((j) => [j.id, j]));
    
    return candidates
      .map((c) => ({
        ...c,
        jobTitle: jobsMap.get(c.jobId)?.title || 'Unknown Job',
        jobSlug: jobsMap.get(c.jobId)?.slug || '',
      }))
      .filter((c) => {
        const params = new URLSearchParams(location.search);
        const jobIdParam = params.get('jobId') || '';

        const matchesSearch =
          !search ||
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase());
        const matchesStage = !stageFilter || c.stage === stageFilter;
        const matchesJob = !jobIdParam || c.jobId === jobIdParam;
        return matchesSearch && matchesStage && matchesJob;
      });
  }, [candidates, jobs, search, stageFilter]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setShowScrollTop(e.currentTarget.scrollTop > 300);
  };

  const scrollToTop = () => {
    document.getElementById('candidate-list')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!candidates || !jobs) {
    return (
      <div className="space-y-4">
        <Card className="p-8 rounded-2xl glass">
          <div className="text-center py-8">
            <div className="animate-wave text-4xl mb-4">🌊</div>
            <p className="text-muted-foreground">Loading candidates...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-6 rounded-2xl border-border/50 glass">
        <div className="flex gap-4">
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border-border/50 focus:border-primary transition-colors"
          />
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-4 py-2 border border-border/50 rounded-xl bg-background text-foreground focus:border-primary focus:outline-none transition-colors"
          >
            <option value="">All Stages</option>
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Candidate List */}
      <Card className="p-6 rounded-2xl border-border/50 glass relative">
        <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Showing {enrichedCandidates.length} candidates
        </p>
        <div
          id="candidate-list"
          onScroll={handleScroll}
          className="border rounded-2xl border-border/50 max-h-[600px] overflow-y-auto space-y-2 p-2"
        >
          {enrichedCandidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02, duration: 0.3 }}
              whileHover={{ scale: 1.01, x: 4 }}
              onClick={() => navigate(`/candidates/${candidate.id}`)}
              className="p-4 cursor-pointer rounded-xl border border-border/30 hover:border-primary/50 bg-card/50 hover:bg-accent/50 transition-all hover-glow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{candidate.name}</h3>
                  <p className="text-sm text-muted-foreground truncate">{candidate.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">Applied for:</span>
                    <Link
                      to={`/jobs/${candidate.jobId}`}
                      className="text-xs text-primary hover:underline truncate font-medium"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {candidate.jobTitle}
                    </Link>
                  </div>
                </div>
                <Badge className={`${STAGE_COLORS[candidate.stage as keyof typeof STAGE_COLORS]} rounded-lg px-3 py-1`}>
                  {candidate.stage}
                </Badge>
              </div>
            </motion.div>
          ))}
          
          {enrichedCandidates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No candidates found</p>
            </div>
          )}
        </div>

        {/* Scroll to Top Button */}
        {showScrollTop && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-8 right-8"
          >
            <Button
              onClick={scrollToTop}
              size="icon"
              className="rounded-full shadow-glow bg-gradient-flow hover:scale-110 transition-transform"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </Card>
    </div>
  );
}
