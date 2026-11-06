import { LayoutDashboard, CalendarRange, Users, UserCircle } from 'lucide-react';
import DashboardLayout from './DashboardLayout.jsx';

const items = [
  { to: '/organizer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/organizer/events', label: 'Manage Events', icon: CalendarRange },
  { to: '/organizer/registrations', label: 'Registrations', icon: Users },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

const topItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/events', label: 'Events', end: true },
  { to: '/organizer/events', label: 'My Events' },
  { to: '/organizer/registrations', label: 'Registrations' },
  { to: '/profile', label: 'Profile' },
];

export default function OrganizerLayout() {
  return <DashboardLayout items={items} topItems={topItems} />;
}
