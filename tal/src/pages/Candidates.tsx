import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CandidateList } from '@/components/candidates/CandidateList';
import { CandidateKanban } from '@/components/candidates/CandidateKanban';

export default function Candidates() {
  const [view, setView] = useState<'list' | 'kanban'>('list');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Candidates</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage candidate applications
          </p>
        </div>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'kanban')}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <CandidateList />
        </TabsContent>

        <TabsContent value="kanban" className="mt-6">
          <CandidateKanban />
        </TabsContent>
      </Tabs>
    </div>
  );
}
