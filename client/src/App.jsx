import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import StudentLayout from './layouts/StudentLayout.jsx';
import OrganizerLayout from './layouts/OrganizerLayout.jsx';
import RoleLayout from './layouts/RoleLayout.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Events from './pages/Events.jsx';
import EventDetails from './pages/EventDetails.jsx';
import EventRegistration from './pages/EventRegistration.jsx';
import MyRegistrations from './pages/MyRegistrations.jsx';
import OrganizerDashboard from './pages/OrganizerDashboard.jsx';
import ManageEvents from './pages/ManageEvents.jsx';
import AddEvent from './pages/AddEvent.jsx';
import EditEvent from './pages/EditEvent.jsx';
import RegistrationManagement from './pages/RegistrationManagement.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';
import Certificate from './pages/Certificate.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<RoleLayout />}>
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
      </Route>

      <Route element={<ProtectedRoute role="student" />}>
        <Route element={<StudentLayout />}>
          <Route path="/events/:id/register" element={<EventRegistration />} />
          <Route path="/student/dashboard" element={<Navigate to="/student/registrations" replace />} />
          <Route path="/student/registrations" element={<MyRegistrations />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="organizer" />}>
        <Route element={<OrganizerLayout />}>
          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/organizer/events" element={<ManageEvents />} />
          <Route path="/organizer/events/create" element={<AddEvent />} />
          <Route path="/organizer/events/edit/:id" element={<EditEvent />} />
          <Route path="/organizer/registrations" element={<RegistrationManagement />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/certificate/:id" element={<Certificate />} />
        </Route>
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
