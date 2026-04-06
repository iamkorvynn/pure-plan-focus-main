import HeroBanner from '@/components/dashboard/HeroBanner';
import CategoryCards from '@/components/dashboard/CategoryCards';
import TaskManager from '@/components/dashboard/TaskManager';
import CalendarView from '@/components/dashboard/CalendarView';
import UpcomingTasks from '@/components/dashboard/UpcomingTasks';
import SpotifyWidget from '@/components/dashboard/SpotifyWidget';
import BottomWidgets, { SidebarHabitWidget } from '@/components/dashboard/BottomWidgets';
import UserHeader from '@/components/dashboard/UserHeader';

export default function Index() {
  return (
    <div className="min-h-screen max-w-[1600px] mx-auto space-y-6 p-4 md:p-6">
      <div className="dashboard-reveal" style={{ ['--delay' as string]: '0ms' }}>
        <HeroBanner />
      </div>
      <div className="dashboard-reveal" style={{ ['--delay' as string]: '80ms' }}>
        <UserHeader />
      </div>
      <div className="dashboard-reveal" style={{ ['--delay' as string]: '140ms' }}>
        <CategoryCards />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-6 dashboard-reveal" style={{ ['--delay' as string]: '220ms' }}>
          <TaskManager />
          <CalendarView />
        </div>

        <div className="space-y-6 dashboard-reveal" style={{ ['--delay' as string]: '300ms' }}>
          <SpotifyWidget />
          <UpcomingTasks />
          <SidebarHabitWidget />
        </div>
      </div>

      <div className="dashboard-reveal" style={{ ['--delay' as string]: '380ms' }}>
        <BottomWidgets />
      </div>
    </div>
  );
}
