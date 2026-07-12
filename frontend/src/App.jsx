import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadData from './pages/UploadData';

// Halaman-halaman lain akan kita buat bertahap
const Placeholder = ({ title }) => <h4>{title} (belum dibuat)</h4>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="upload" element={<UploadData />} />
            <Route path="upload/history" element={<Placeholder title="Histori Upload" />} />
            <Route path="transaksi" element={<Placeholder title="Data Transaksi" />} />
            <Route path="profil" element={<Placeholder title="Profil" />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;