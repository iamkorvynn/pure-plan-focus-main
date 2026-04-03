import { TaskProvider } from '@/contexts/TaskContext';
import HeroBanner from '@/components/dashboard/HeroBanner';
import CategoryCards from '@/components/dashboard/CategoryCards';
import TaskManager from '@/components/dashboard/TaskManager';
import CalendarView from '@/components/dashboard/CalendarView';
import UpcomingTasks from '@/components/dashboard/UpcomingTasks';
import SpotifyWidget from '@/components/dashboard/SpotifyWidget';
import BottomWidgets from '@/components/dashboard/BottomWidgets';
import UserHeader from '@/components/dashboard/UserHeader';

export default function Index() {
  return (
    <TaskProvider>
      <div className="min-h-screen p-4 md:p-6 max-w-[1600px] mx-auto space-y-6">
        <HeroBanner />
        <UserHeader />
        <CategoryCards />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-6">
            <TaskManager />
            <CalendarView />
          </div>

          <div className="space-y-6">
            <SpotifyWidget />
            <UpcomingTasks />
          </div>
        </div>

        <BottomWidgets />
      </div>
    </TaskProvider>
  );
}
