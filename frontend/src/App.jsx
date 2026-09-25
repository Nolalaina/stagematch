import { Routes, Route, Navigate } from 'react-router-dom';
import Topbar from './components/Topbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import StudentProfile from './pages/StudentProfile.jsx';
import StudentApplications from './pages/StudentApplications.jsx';
import InternshipSearch from './pages/InternshipSearch.jsx';
import OfferDetail from './pages/OfferDetail.jsx';
import CompanyDashboard from './pages/CompanyDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';
import { useAuth } from './context/AuthContext.jsx';

function Protected({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="app-shell">
      <Topbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/internships" element={<InternshipSearch />} />
        <Route path="/internships/:id" element={<OfferDetail />} />

        <Route path="/student" element={<Protected role="student"><StudentDashboard /></Protected>} />
        <Route path="/student/profile" element={<Protected role="student"><StudentProfile /></Protected>} />
        <Route path="/student/applications" element={<Protected role="student"><StudentApplications /></Protected>} />

        <Route path="/company" element={<Protected role="company"><CompanyDashboard /></Protected>} />

        <Route path="/admin" element={<Protected role="admin"><AdminDashboard /></Protected>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}
