import { RemindersSummary } from '../components/RemindersCard';
import { TasksSummary } from '../components/TaskBoard';
import { FocusSummary } from '../components/FocusTimer';
import { BrainDumpSummary } from '../components/BrainDump';
import { HabitsSummary } from '../components/Habits';
import { StatsSummary } from '../components/Stats';
import { CalendarSummary } from '../components/Calendar';

export default function Dashboard({ tasks, sessionLog, timer }) {
  return (
    <div className="dashboard-grid">
      <RemindersSummary />
      <TasksSummary tasks={tasks} />
      <FocusSummary timer={timer} />
      <BrainDumpSummary />
      <HabitsSummary />
      <StatsSummary tasks={tasks} sessionLog={sessionLog} />
      <CalendarSummary />
    </div>
  );
}
