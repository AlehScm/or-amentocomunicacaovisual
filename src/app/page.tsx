import { KanbanBoard } from '@/components/kanban-board';
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <KanbanBoard />
    </Suspense>
  );
}
