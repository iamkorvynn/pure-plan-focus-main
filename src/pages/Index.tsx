import BottomWidgets, { SidebarHabitWidget } from '@/components/dashboard/BottomWidgets';
import CalendarView from '@/components/dashboard/CalendarView';
import CategoryCards from '@/components/dashboard/CategoryCards';
import HeroBanner from '@/components/dashboard/HeroBanner';
import SpotifyWidget from '@/components/dashboard/SpotifyWidget';
import TaskManager from '@/components/dashboard/TaskManager';
import UpcomingTasks from '@/components/dashboard/UpcomingTasks';
import UserHeader from '@/components/dashboard/UserHeader';

export default function Index() {
  return (
    <main className="mx-auto min-h-screen max-w-[1680px] px-4 pb-10 pt-4 md:px-6 md:pb-12 lg:px-8">
      <div className="dashboard-reveal sticky top-4 z-40" style={{ ['--delay' as string]: '0ms' }}>
        <UserHeader />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
        <div className="space-y-6">
          <div className="dashboard-reveal" style={{ ['--delay' as string]: '80ms' }}>
            <HeroBanner />
          </div>
          <div className="dashboard-reveal" style={{ ['--delay' as string]: '150ms' }}>
            <CategoryCards />
          </div>
          <div className="dashboard-reveal" style={{ ['--delay' as string]: '220ms' }}>
            <TaskManager />
          </div>
        </div>

        <div className="space-y-6">
          <div className="dashboard-reveal" style={{ ['--delay' as string]: '290ms' }}>
            <UpcomingTasks />
          </div>
          <div className="dashboard-reveal" style={{ ['--delay' as string]: '360ms' }}>
            <SidebarHabitWidget />
          </div>
          <div className="dashboard-reveal" style={{ ['--delay' as string]: '430ms' }}>
            <SpotifyWidget />
          </div>
        </div>
      </div>

      <div className="mt-6 dashboard-reveal" style={{ ['--delay' as string]: '500ms' }}>
        <CalendarView />
      </div>

      <div className="mt-6 dashboard-reveal" style={{ ['--delay' as string]: '580ms' }}>
        <BottomWidgets />
      </div>
    </main>
  );
}
