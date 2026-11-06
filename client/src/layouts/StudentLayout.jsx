import { Home, CalendarDays, ClipboardList, UserCircle } from 'lucide-react';
import DashboardLayout from './DashboardLayout.jsx';

const items = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/student/registrations', label: 'My Registrations', icon: ClipboardList },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

export default function StudentLayout() {
  return <DashboardLayout items={items} topItems={items} />;
}
