import { useAuth } from '../context/AuthContext.jsx';
import StudentLayout from './StudentLayout.jsx';
import OrganizerLayout from './OrganizerLayout.jsx';
import PublicLayout from './PublicLayout.jsx';

// Events pages are public: logged-in users see their own sidebar, visitors see the public header
export default function RoleLayout() {
  const { user } = useAuth();
  if (user?.role === 'organizer') return <OrganizerLayout />;
  if (user?.role === 'student') return <StudentLayout />;
  return <PublicLayout />;
}
