import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { Card } from '@/components/ui/card';
import { Briefcase, Users, ClipboardList, Archive, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';

const STAGE_COLORS = {
  applied: '#94a3b8',
  screen: '#fbbf24',
  tech: '#007BFF',
  offer: '#6C63FF',
  hired: '#10b981',
  rejected: '#ef4444',
};

const JOB_COLORS = {
  active: '#007BFF',
  archived: '#94a3b8',
};

export default function Dashboard() {
  const navigate = useNavigate();
  
  const jobs = useLiveQuery(() => db.jobs.toArray(), []);
  const candidates = useLiveQuery(() => db.candidates.toArray(), []);
  const assessments = useLiveQuery(() => db.assessments.toArray(), []);

  if (!jobs || !candidates || !assessments) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-wave text-4xl mb-4">🌊</div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const activeJobs = jobs.filter((j) => j.status === 'active').length;
  const archivedJobs = jobs.filter((j) => j.status === 'archived').length;
  const totalCandidates = candidates.length;

  // Count only assessments that belong to active jobs so dashboard reflects live active assessments
  const activeAssessments = assessments.filter((a) => {
    const job = jobs.find((j) => j.id === a.jobId);
    return job?.status === 'active';
  }).length;

  // Candidates by stage
  const candidatesByStage = candidates.reduce((acc, c) => {
    acc[c.stage] = (acc[c.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stageData = Object.entries(candidatesByStage).map(([stage, count]) => ({
    stage: stage.charAt(0).toUpperCase() + stage.slice(1),
    count,
    fill: STAGE_COLORS[stage as keyof typeof STAGE_COLORS],
  }));

  // Job status distribution
  const jobStatusData = [
    { name: 'Active', value: activeJobs, fill: '#007BFF' },
    { name: 'Archived', value: archivedJobs, fill: '#94a3b8' },
  ];

  // Recent jobs and candidates
  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const recentCandidates = [...candidates]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((c) => ({
      ...c,
      jobTitle: jobs.find((j) => j.id === c.jobId)?.title || 'Unknown',
      jobId: c.jobId,
    }));

  const metrics = [
    {
      title: 'Active Jobs',
      value: activeJobs,
      icon: Briefcase,
      subtext: 'Open positions',
      trend: '+12%',
      onClick: () => navigate('/jobs?status=active', { replace: true }),
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Candidates',
      value: totalCandidates,
      icon: Users,
      subtext: 'Across all stages',
      trend: '+24%',
      onClick: () => navigate('/candidates'),
      gradient: 'from-violet-500 to-violet-600',
    },
    {
      title: 'Assessments',
      value: activeAssessments,
      icon: ClipboardList,
      subtext: 'Active assessments',
      trend: '+8%',
      onClick: () => navigate('/assessments'),
      gradient: 'from-cyan-500 to-cyan-600',
    },
    {
      title: 'Archived Jobs',
      value: archivedJobs,
      icon: Archive,
      subtext: 'Completed roles',
      trend: '-3%',
      onClick: () => navigate('/jobs?status=archived', { replace: true }),
      gradient: 'from-slate-500 to-slate-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-flow bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome to TalentFlow – Your hiring command center
        </p>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={metric.onClick}
            className="cursor-pointer"
          >
            <Card className="p-6 rounded-2xl border-border/50 hover-glow transition-all glass">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    {metric.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold">{metric.value}</h3>
                    <span className="text-xs text-success flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {metric.trend}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{metric.subtext}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.gradient}`}>
                  <metric.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Candidates by Stage */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="p-6 rounded-2xl border-border/50">
            <h3 className="text-lg font-semibold mb-4">Candidates by Stage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="stage" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Job Status Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Card className="p-6 rounded-2xl border-border/50">
            <h3 className="text-lg font-semibold mb-4">Job Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={jobStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {jobStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.75rem',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Jobs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card className="p-6 rounded-2xl border-border/50">
            <h3 className="text-lg font-semibold mb-4">Recent Jobs</h3>
            <div className="space-y-3">
              {recentJobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <Link
                    to={`/jobs/${job.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate group-hover:text-primary transition-colors">
                        {job.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-lg"
                      style={{
                        backgroundColor: `${JOB_COLORS[job.status as keyof typeof JOB_COLORS]}20`,
                        color: JOB_COLORS[job.status as keyof typeof JOB_COLORS],
                        textTransform: 'capitalize',
                      }}
                    >
                      {job.status}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Recent Candidates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <Card className="p-6 rounded-2xl border-border/50">
            <h3 className="text-lg font-semibold mb-4">Recent Candidates</h3>
            <div className="space-y-3">
              {recentCandidates.map((candidate, index) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <Link
                    to={`/candidates/${candidate.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate group-hover:text-primary transition-colors">
                        {candidate.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        Applied for:{' '}
                        <Link
                          to={`/jobs/${candidate.jobId}`}
                          className="text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {candidate.jobTitle}
                        </Link>
                      </p>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-lg"
                      style={{
                        backgroundColor: `${STAGE_COLORS[candidate.stage as keyof typeof STAGE_COLORS]}20`,
                        color: STAGE_COLORS[candidate.stage as keyof typeof STAGE_COLORS],
                      }}
                    >
                      {candidate.stage}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
