import { createServer, Model, Factory, Response } from 'miragejs';
import { faker } from '@faker-js/faker';
import { db, Job, Candidate, Assessment, Timeline } from './db';

// Default latency and error rate for development; override to faster, no-error
// behavior when demo mode is enabled so previews are snappy and reliable.
const DEFAULT_LATENCY = { min: 200, max: 1200 };
const DEFAULT_ERROR_RATE = 0.05;

const isDemo = import.meta.env.VITE_ENABLE_MIRAGE === '1';
const LATENCY = isDemo ? { min: 20, max: 80 } : DEFAULT_LATENCY;
const ERROR_RATE = isDemo ? 0 : DEFAULT_ERROR_RATE;

const simulateLatency = () => {
  return new Promise(resolve => {
    const delay = Math.random() * (LATENCY.max - LATENCY.min) + LATENCY.min;
    setTimeout(resolve, delay);
  });
};

const shouldSimulateError = () => Math.random() < ERROR_RATE;

let _server: any = null;

export function makeServer() {
  _server = createServer({
    models: {
      job: Model,
      candidate: Model,
      timeline: Model,
      assessment: Model,
    },

    factories: {
      job: Factory.extend({
        id() {
          return faker.string.uuid();
        },
        title() {
          return faker.person.jobTitle();
        },
        slug() {
          return faker.helpers.slugify(this.title).toLowerCase();
        },
        description() {
          const role = this.title;
          const benefits = [
            'Comprehensive health, dental, and vision insurance',
            'Flexible working hours and unlimited PTO',
            'Professional development and learning stipend',
            'Home office setup allowance',
            'Wellness programs and gym membership',
            '401(k) matching and financial planning',
            'Regular team building and social events',
            'Parental leave and family support programs'
          ];
          
          return `
About the Role:
${faker.lorem.paragraph(3)}

Key Responsibilities:
• ${faker.company.catchPhrase()}
• ${faker.company.catchPhrase()}
• ${faker.company.catchPhrase()}
• ${faker.company.catchPhrase()}

Required Qualifications:
• ${faker.number.int({ min: 3, max: 8 })}+ years of experience in ${faker.company.buzzPhrase()}
• Strong background in ${faker.company.buzzPhrase()}
• Experience with ${faker.company.buzzPhrase()}
• ${faker.company.catchPhrase()}

Benefits:
• Competitive salary and equity package
• ${faker.helpers.arrayElement(benefits)}
• ${faker.helpers.arrayElement(benefits)}
• ${faker.helpers.arrayElement(benefits)}
• ${faker.helpers.arrayElement(benefits)}

Location: ${faker.helpers.arrayElement(['Remote', 'Hybrid', 'On-site'])} (${faker.location.city()}, ${faker.location.country()})
`.trim();
        },
        status() {
          return faker.helpers.arrayElement(['active', 'archived']);
        },
        tags() {
          return faker.helpers.arrayElements(
            ['Engineering', 'Design', 'Marketing', 'Sales', 'Product', 'Remote', 'Onsite'],
            { min: 1, max: 3 }
          );
        },
        
        order(i: number) {
          return i;
        },
        createdAt() {
          return faker.date.past().toISOString();
        },
        updatedAt() {
          return new Date().toISOString();
        },
      }),

      candidate: Factory.extend({
        id() {
          return faker.string.uuid();
        },
        name() {
          return faker.person.fullName();
        },
        email() {
          return faker.internet.email();
        },
        phone() {
          return faker.phone.number();
        },
        stage() {
          return faker.helpers.arrayElement(['applied', 'screen', 'tech', 'offer', 'hired', 'rejected']);
        },
        jobId(i: number) {
          return `job-${(i % 25) + 1}`;
        },
        tags() {
          return faker.helpers.arrayElements(
            ['Frontend', 'Backend', 'Fullstack', 'Senior', 'Junior', 'Mid-level'],
            { min: 0, max: 2 }
          );
        },
        notes() {
          return faker.lorem.paragraph();
        },
        createdAt() {
          return faker.date.past().toISOString();
        },
        updatedAt() {
          return new Date().toISOString();
        },
      }),
    },

    seeds(server) {
      server.createList('job', 25);
      server.createList('candidate', 1000);
    },

    routes() {
      this.namespace = 'api';

      // Dashboard endpoint
      this.get('/dashboard/summary', async () => {
        await simulateLatency();
        if (shouldSimulateError()) {
          return new Response(500, {}, { error: 'Internal server error' });
        }

        const jobs = await db.jobs.toArray();
        const candidates = await db.candidates.toArray();
        const assessments = await db.assessments.toArray();

        const activeJobs = jobs.filter(j => j.status === 'active').length;
        const archivedJobs = jobs.filter(j => j.status === 'archived').length;

        const candidatesPerStage = candidates.reduce((acc, c) => {
          acc[c.stage] = (acc[c.stage] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const jobsMap = new Map(jobs.map((j) => [j.id, j.title]));

        const recentJobs = jobs
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map(j => ({ id: j.id, title: j.title, createdAt: j.createdAt }));

        const recentCandidates = candidates
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, 5)
          .map(c => ({ 
            id: c.id, 
            name: c.name, 
            stage: c.stage, 
            updatedAt: c.updatedAt,
            jobId: c.jobId,
            jobTitle: jobsMap.get(c.jobId) || 'Unknown Job'
          }));

        return {
          totalJobs: jobs.length,
          activeJobs,
          archivedJobs,
          totalCandidates: candidates.length,
          assessmentsCount: assessments.length,
          candidatesPerStage,
          recentJobs,
          recentCandidates,
        };
      });

      // Jobs endpoints
      this.get('/jobs', async (schema, request) => {
        await simulateLatency();
        if (shouldSimulateError()) {
          return new Response(500, {}, { error: 'Internal server error' });
        }

        const search = String(request.queryParams.search || '');
        const status = String(request.queryParams.status || '');
        const page = parseInt(String(request.queryParams.page || '1'));
        const pageSize = parseInt(String(request.queryParams.pageSize || '10'));
        const sort = String(request.queryParams.sort || 'order');

        let jobs = await db.jobs.toArray();

        if (search) {
          jobs = jobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()));
        }
        
        // Filter by status case-insensitively
        if (status) {
          jobs = jobs.filter(j => j.status.toLowerCase() === status.toLowerCase());
        }

        // Then apply sorting
        if (sort === 'title') {
          jobs.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sort === 'status') {
          jobs.sort((a, b) => a.status.localeCompare(b.status));
        } else {
          jobs.sort((a, b) => a.order - b.order);
        }

        const total = jobs.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedJobs = jobs.slice(start, end);

        return {
          jobs: paginatedJobs,
          total,
          page,
          pageSize,
        };
      });

      this.get('/jobs/:id', async (schema, request) => {
        await simulateLatency();
        if (shouldSimulateError()) {
          return new Response(500, {}, { error: 'Internal server error' });
        }

        const job = await db.jobs.get(request.params.id);
        if (!job) {
          return new Response(404, {}, { error: 'Job not found' });
        }
        return { job };
      });

      this.post('/jobs', async (schema, request) => {
        await simulateLatency();
        if (shouldSimulateError()) {
          return new Response(500, {}, { error: 'Internal server error' });
        }

        const attrs = JSON.parse(request.requestBody);
        const job: Job = {
          id: faker.string.uuid(),
          title: attrs.title,
          slug: faker.helpers.slugify(attrs.title).toLowerCase(),
          description: attrs.description || '',
          status: attrs.status || 'active',
          tags: attrs.tags || [],
          order: (await db.jobs.count()) + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await db.jobs.add(job);
        return { job };
      });

      this.patch('/jobs/:id', async (schema, request) => {
        await simulateLatency();
        if (shouldSimulateError()) {
          return new Response(500, {}, { error: 'Internal server error' });
        }

        const attrs = JSON.parse(request.requestBody);
        await db.jobs.update(request.params.id, {
          ...attrs,
          updatedAt: new Date().toISOString(),
        });

        const job = await db.jobs.get(request.params.id);
        return { job };
      });

      this.patch('/jobs/:id/reorder', async (schema, request) => {
        await simulateLatency();
        if (shouldSimulateError()) {
          return new Response(500, {}, { error: 'Internal server error' });
        }

        const { newOrder } = JSON.parse(request.requestBody);
        await db.jobs.update(request.params.id, {
          order: newOrder,
          updatedAt: new Date().toISOString(),
        });

        const job = await db.jobs.get(request.params.id);
        return { job };
      });

      // Candidates endpoints
      this.get('/candidates', async (schema, request) => {
        await simulateLatency();
        if (shouldSimulateError()) {
          return new Response(500, {}, { error: 'Internal server error' });
        }

        const search = String(request.queryParams.search || '');
        const stage = String(request.queryParams.stage || '');
        const page = parseInt(String(request.queryParams.page || '1'));
        const pageSize = parseInt(String(request.queryParams.pageSize || '50'));

        let candidates = await db.candidates.toArray();

        if (search) {
          candidates = candidates.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase())
          );
        }
        if (stage) {
          candidates = candidates.filter(c => c.stage === stage);
        }

        const total = candidates.length;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedCandidates = candidates.slice(start, end);

        return {
          candidates: paginatedCandidates,
          total,
          page,
          pageSize,
        };
      });

      this.get('/candidates/:id', async (schema, request) => {
        await simulateLatency();
        if (shouldSimulateError()) {
          return new Response(500, {}, { error: 'Internal server error' });
        }

        const candidate = await db.candidates.get(request.params.id);
        if (!candidate) {
          return new Response(404, {}, { error: 'Candidate not found' });
        }
        return { candidate };
      });

      this.get('/candidates/:id/timeline', async (schema, request) => {
        await simulateLatency();
        if (shouldSimulateError()) {
          return new Response(500, {}, { error: 'Internal server error' });
        }

        const timeline = await db.timelines
          .where('candidateId')
          .equals(request.params.id)
          .toArray();

        return { timeline };
      });

      this.post('/candidates', async (schema, request) => {
        await simulateLatency();
        if (shouldSimulateError()) {
          return new Response(500, {}, { error: 'Internal server error' });
        }

        const attrs = JSON.parse(request.requestBody);
        const candidate: Candidate = {
          id: faker.string.uuid(),
          name: attrs.name,
          email: attrs.email,
          phone: attrs.phone || '',
          stage: attrs.stage || 'applied',
          jobId: attrs.jobId,
          tags: attrs.tags || [],
          notes: attrs.notes || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await db.candidates.add(candidate);
        return { candidate };
      });

      this.patch('/candidates/:id', async (schema, request) => {
        await simulateLatency();
        if (shouldSimulateError()) {
          return new Response(500, {}, { error: 'Internal server error' });
        }

        const attrs = JSON.parse(request.requestBody);
        const oldCandidate = await db.candidates.get(request.params.id);

        await db.candidates.update(request.params.id, {
          ...attrs,
          updatedAt: new Date().toISOString(),
        });

        if (oldCandidate && attrs.stage && oldCandidate.stage !== attrs.stage) {
          const timeline: Timeline = {
            id: faker.string.uuid(),
            candidateId: request.params.id,
            fromStage: oldCandidate.stage,
            toStage: attrs.stage,
            note: attrs.note,
            timestamp: new Date().toISOString(),
          };
          await db.timelines.add(timeline);
        }

        const candidate = await db.candidates.get(request.params.id);
        return { candidate };
      });

      // Assessments endpoints
      // List all assessments (used by UI to show which jobs have assessments)
      this.get('/assessments', async () => {
        await simulateLatency();
        if (shouldSimulateError()) {
          return new Response(500, {}, { error: 'Internal server error' });
        }

        const assessments = await db.assessments.toArray();
        return { assessments };
      });

      this.get('/assessments/:jobId', async (schema, request) => {
        await simulateLatency();
        if (shouldSimulateError()) {
          return new Response(500, {}, { error: 'Internal server error' });
        }

        const assessment = await db.assessments.get({ jobId: request.params.jobId });
        return { assessment };
      });

      this.put('/assessments/:jobId', async (schema, request) => {
        await simulateLatency();
        if (shouldSimulateError()) {
          return new Response(500, {}, { error: 'Internal server error' });
        }

        const attrs = JSON.parse(request.requestBody);
        const existing = await db.assessments.get({ jobId: request.params.jobId });

        if (existing) {
          await db.assessments.update(existing.id, {
            ...attrs,
            updatedAt: new Date().toISOString(),
          });
        } else {
          const assessment: Assessment = {
            id: faker.string.uuid(),
            jobId: request.params.jobId,
            title: attrs.title,
            sections: attrs.sections,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await db.assessments.add(assessment);
        }

        const assessment = await db.assessments.get({ jobId: request.params.jobId });
        return { assessment };
      });

      this.post('/assessments/:jobId/submit', async (schema, request) => {
        await simulateLatency();
        if (shouldSimulateError()) {
          return new Response(500, {}, { error: 'Internal server error' });
        }

        const attrs = JSON.parse(request.requestBody);
        const response = {
          id: faker.string.uuid(),
          assessmentId: attrs.assessmentId,
          candidateId: attrs.candidateId,
          responses: attrs.responses,
          submittedAt: new Date().toISOString(),
        };

        await db.assessmentResponses.add(response);
        return { response };
      });
    },
  });
}

export function stopServer() {
  if (_server) {
    try {
      _server.shutdown();
    } catch (e) {}
    _server = null;
  }
}

export function serverRunning() {
  return !!_server;
}
