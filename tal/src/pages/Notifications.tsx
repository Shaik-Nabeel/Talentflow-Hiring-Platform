import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';

export default function Notifications() {
  const [items, setItems] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const existing = await db.notifications?.toArray();
      if (!existing || existing.length === 0) {
        // seed sample notifications
        const now = new Date().toISOString();
        const samples = [
          { id: 'n1', title: 'New candidate applied', body: 'John Doe applied to Software Engineer', read: false, timestamp: now },
          { id: 'n2', title: 'Assessment completed', body: 'Assessment for Frontend Developer completed', read: false, timestamp: now },
        ];
        for (const s of samples) await db.notifications?.put(s);
        setItems(samples);
      } else {
        setItems(existing.sort((a:any,b:any)=> new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      }
    };
    load();
  }, []);

  const mark = async (id: string, read: boolean) => {
    const item = await db.notifications?.get(id);
    if (!item) return;
    await db.notifications?.update(id, { read });
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, read } : p)));
  };

  const remove = async (id: string) => {
    await db.notifications?.delete(id);
    setItems((prev) => prev.filter((p) => p.id !== id));
    toast({ title: 'Deleted', description: 'Notification removed' });
  };

  const clearAll = async () => {
    await db.notifications?.clear();
    setItems([]);
    toast({ title: 'Cleared', description: 'All notifications removed' });
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card className="p-8 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Notifications</h2>
            <p className="text-muted-foreground">In-app alerts and activity</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={clearAll}>Clear all</Button>
          </div>
        </div>

        <div className="space-y-3">
          {items.length === 0 && <p className="text-muted-foreground">No notifications</p>}
          {items.map((it) => (
            <div key={it.id} className={`p-3 rounded-lg border ${it.read ? 'bg-card/50' : 'bg-accent/5'} flex items-start justify-between` }>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{it.title}</h4>
                  <span className="text-xs text-muted-foreground">{new Date(it.timestamp).toLocaleString()}</span>
                </div>
                {it.body && <p className="text-sm text-muted-foreground mt-1">{it.body}</p>}
              </div>
              <div className="flex flex-col gap-2 items-end">
                <Button variant="ghost" size="sm" onClick={() => mark(it.id, !it.read)}>{it.read ? 'Mark unread' : 'Mark read'}</Button>
                <Button variant="ghost" size="sm" onClick={() => remove(it.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
