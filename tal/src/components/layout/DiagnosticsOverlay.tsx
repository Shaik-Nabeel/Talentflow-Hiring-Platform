import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { diagnosticsBuffer } from '@/lib/api';
import { seedDatabase } from '@/lib/seed-data';
import { makeServer, stopServer, serverRunning } from '@/lib/mirage-server';

async function testApi() {
  try {
    const res = await fetch('/api/jobs?page=1&pageSize=1');
    return { ok: res.ok, status: res.status, body: await res.text() };
  } catch (e: any) {
    return { ok: false, status: 0, body: String(e) };
  }
}

export default function DiagnosticsOverlay() {
  const [counts, setCounts] = useState({ jobs: 0, candidates: 0, assessments: 0 });
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const jobs = await db.jobs.count();
      const candidates = await db.candidates.count();
      const assessments = await db.assessments.count();
      setCounts({ jobs, candidates, assessments });
      setLogs(diagnosticsBuffer.slice(0, 10));
    };
    load();

    const iv = setInterval(load, 2500);
    return () => clearInterval(iv);
  }, []);

  const isDemo = import.meta.env.DEV || import.meta.env.VITE_ENABLE_MIRAGE === '1';

  return (
    <div style={{ position: 'fixed', right: 12, bottom: 12, zIndex: 9999 }}>
      <div style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid #eee', padding: 10, borderRadius: 8, width: 300, boxShadow: '0 6px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <strong style={{ fontSize: 13 }}>Diagnostics</strong>
          <span style={{ fontSize: 12, color: isDemo ? '#1e40af' : '#374151' }}>{isDemo ? 'Demo (Mirage on)' : 'Prod Mode'}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div style={{ fontSize: 12 }}><strong>{counts.jobs}</strong><div style={{ fontSize: 10, color: '#6b7280' }}>Jobs</div></div>
          <div style={{ fontSize: 12 }}><strong>{counts.candidates}</strong><div style={{ fontSize: 10, color: '#6b7280' }}>Candidates</div></div>
          <div style={{ fontSize: 12 }}><strong>{counts.assessments}</strong><div style={{ fontSize: 10, color: '#6b7280' }}>Assessments</div></div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
          <button
            onClick={async () => {
              await seedDatabase(true);
              const jobs = await db.jobs.count();
              const candidates = await db.candidates.count();
              const assessments = await db.assessments.count();
              setCounts({ jobs, candidates, assessments });
            }}
            style={{ fontSize: 12, padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff' }}
          >
            Seed
          </button>

          <button
            onClick={async () => {
              if (serverRunning()) {
                stopServer();
              } else {
                makeServer();
              }
              setTimeout(() => {
                setLogs(diagnosticsBuffer.slice(0, 10));
              }, 300);
            }}
            style={{ fontSize: 12, padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff' }}
          >
            {serverRunning() ? 'Stop Mirage' : 'Start Mirage'}
          </button>

          <button
            onClick={async () => {
              const r = await testApi();
              setLogs(l => [`testApi: ok=${r.ok} status=${r.status}`, ...l].slice(0, 10));
            }}
            style={{ fontSize: 12, padding: '6px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff' }}
          >
            Test API
          </button>
        </div>

        <div style={{ maxHeight: 140, overflow: 'auto' }}>
          {logs.length === 0 ? (
            <div style={{ fontSize: 12, color: '#6b7280' }}>No recent fallback logs</div>
          ) : (
            logs.map((l, i) => (
              <div key={i} style={{ fontSize: 11, color: '#374151', marginBottom: 6 }}>{l}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
