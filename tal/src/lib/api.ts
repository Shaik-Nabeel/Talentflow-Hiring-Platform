import { db } from './db';

async function tryFetch(path: string, opts?: RequestInit) {
  try {
    const res = await fetch(path, opts);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (e) {
    // Network failed — let callers fall back to Dexie but log for debugging
    console.info(`[api] network fetch failed for ${path}, falling back to local DB`);
    return undefined;
  }
}

export async function fetchJobs(params: { page?: number; pageSize?: number; search?: string; status?: string; sort?: string } = {}) {
  const qs = new URLSearchParams({
    page: String(params.page || 1),
    pageSize: String(params.pageSize || 10),
    search: params.search || '',
    status: params.status || '',
    sort: params.sort || 'order',
  });

  const network = await tryFetch(`/api/jobs?${qs.toString()}`);
  if (network) return network;
  // Fallback to Dexie
  console.info('[api] using Dexie fallback for fetchJobs');
  let jobs = await db.jobs.toArray();
  if (params.search) {
    jobs = jobs.filter(j => j.title.toLowerCase().includes((params.search || '').toLowerCase()));
  }
  if (params.status) {
    jobs = jobs.filter(j => String(j.status).toLowerCase() === String(params.status).toLowerCase());
  }
  if (params.sort === 'title') jobs.sort((a, b) => a.title.localeCompare(b.title));
  else if (params.sort === 'status') jobs.sort((a, b) => a.status.localeCompare(b.status));
  else jobs.sort((a, b) => a.order - b.order);

  const total = jobs.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const paginated = jobs.slice(start, start + pageSize);

  return { jobs: paginated, total, page, pageSize };
}

export async function fetchJob(id: string) {
  const network = await tryFetch(`/api/jobs/${id}`);
  if (network) return network;

  console.info(`[api] using Dexie fallback for fetchJob:${id}`);
  const job = await db.jobs.get(id);
  if (!job) return { error: 'not found' };
  return { job };
}

export async function createOrUpdateJob(payload: any, id?: string) {
  const method = id ? 'PATCH' : 'POST';
  const path = id ? `/api/jobs/${id}` : '/api/jobs';
  const network = await tryFetch(path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (network) return network;

  // Dexie fallback
  console.info(`[api] using Dexie fallback for createOrUpdateJob id=${id || 'new'}`);
  if (id) {
    await db.jobs.update(id, { ...payload, updatedAt: new Date().toISOString() });
    const job = await db.jobs.get(id);
    return { job };
  } else {
    const job = {
      id: `job-${Date.now()}`,
      title: payload.title,
      slug: (payload.title || '').toLowerCase().replace(/\s+/g, '-'),
      description: payload.description || '',
      status: payload.status || 'active',
      tags: payload.tags || [],
      order: (await db.jobs.count()) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.jobs.add(job);
    return { job };
  }
}

export async function patchJob(id: string, payload: any) {
  const network = await tryFetch(`/api/jobs/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (network) return network;
  console.info(`[api] using Dexie fallback for patchJob id=${id}`);
  await db.jobs.update(id, { ...payload, updatedAt: new Date().toISOString() });
  const job = await db.jobs.get(id);
  return { job };
}

export async function reorderJob(id: string, newOrder: number) {
  const network = await tryFetch(`/api/jobs/${id}/reorder`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newOrder }) });
  if (network) return network;
  await db.jobs.update(id, { order: newOrder, updatedAt: new Date().toISOString() });
  const job = await db.jobs.get(id);
  return { job };
}

export async function fetchCandidates(params: { page?: number; pageSize?: number; search?: string; stage?: string; jobId?: string } = {}) {
  const qs = new URLSearchParams({
    page: String(params.page || 1),
    pageSize: String(params.pageSize || 50),
    search: params.search || '',
    stage: params.stage || '',
    jobId: params.jobId || '',
  });

  const network = await tryFetch(`/api/candidates?${qs.toString()}`);
  if (network) return network;

  console.info('[api] using Dexie fallback for fetchCandidates');
  let candidates = await db.candidates.toArray();
  if (params.search) {
    candidates = candidates.filter(c => c.name.toLowerCase().includes(params.search!.toLowerCase()) || c.email.toLowerCase().includes(params.search!.toLowerCase()));
  }
  if (params.stage) candidates = candidates.filter(c => c.stage === params.stage);
  if (params.jobId) candidates = candidates.filter(c => c.jobId === params.jobId);

  const total = candidates.length;
  const page = params.page || 1;
  const pageSize = params.pageSize || 50;
  const start = (page - 1) * pageSize;
  const paginated = candidates.slice(start, start + pageSize);
  return { candidates: paginated, total, page, pageSize };
}

export async function fetchCandidate(id: string) {
  const network = await tryFetch(`/api/candidates/${id}`);
  if (network) return network;
  console.info(`[api] using Dexie fallback for fetchCandidate id=${id}`);
  const candidate = await db.candidates.get(id);
  if (!candidate) return { error: 'not found' };
  return { candidate };
}

export async function fetchTimeline(candidateId: string) {
  const network = await tryFetch(`/api/candidates/${candidateId}/timeline`);
  if (network) return network;
  console.info(`[api] using Dexie fallback for fetchTimeline candidateId=${candidateId}`);
  const timeline = await db.timelines.where('candidateId').equals(candidateId).toArray();
  return { timeline };
}

export async function patchCandidate(id: string, payload: any) {
  const network = await tryFetch(`/api/candidates/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (network) return network;
  console.info(`[api] using Dexie fallback for patchCandidate id=${id}`);
  await db.candidates.update(id, { ...payload, updatedAt: new Date().toISOString() });
  const candidate = await db.candidates.get(id);
  return { candidate };
}

export async function fetchAssessments() {
  const network = await tryFetch('/api/assessments');
  if (network) return network;
  console.info('[api] using Dexie fallback for fetchAssessments');
  const assessments = await db.assessments.toArray();
  return { assessments };
}

export async function fetchAssessmentByJob(jobId: string) {
  const network = await tryFetch(`/api/assessments/${jobId}`);
  if (network) return network;
  console.info(`[api] using Dexie fallback for fetchAssessmentByJob jobId=${jobId}`);
  const assessment = await db.assessments.where('jobId').equals(jobId).first();
  if (!assessment) return { assessment: null };
  return { assessment };
}

export async function saveAssessment(jobId: string, payload: any) {
  const network = await tryFetch(`/api/assessments/${jobId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (network) return network;
  console.info(`[api] using Dexie fallback for saveAssessment jobId=${jobId}`);
  // Upsert into Dexie
  const existing = await db.assessments.where('jobId').equals(jobId).first();
  if (existing) {
    await db.assessments.update(existing.id, { ...payload, updatedAt: new Date().toISOString() });
    const assessment = await db.assessments.get(existing.id);
    return { assessment };
  }
  const id = `assessment-${Date.now()}`;
  const assessment = { id, jobId, ...payload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  await db.assessments.add(assessment);
  return { assessment };
}

export default {
  fetchJobs,
  fetchJob,
  createOrUpdateJob,
  patchJob,
  reorderJob,
  fetchCandidates,
  fetchCandidate,
  fetchTimeline,
  patchCandidate,
  fetchAssessments,
  fetchAssessmentByJob,
  saveAssessment,
};
