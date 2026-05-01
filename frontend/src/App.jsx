import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Chat from './pages/Chat';
import AdminDashboard from './pages/AdminDashboard';
import Layout from './components/Layout';

function PrivateRoute({ children, role }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="h-screen flex items-center justify-center text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return <Layout>{children}</Layout>;
}

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="bg-gray-900 h-screen"></div>;

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          
          <Route path="/" element={
            <PrivateRoute>
              {user?.role === 'admin' ? <AdminDashboard /> : <Chat />}
            </PrivateRoute>
          } />

          <Route path="/chat" element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          } />

          <Route path="/admin" element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
