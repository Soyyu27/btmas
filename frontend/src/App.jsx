import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadData from './pages/UploadData';
import UploadHistory from './pages/UploadHistory';
import DataTransaksi from './pages/DataTransaksi';
import Profil from './pages/Profil';
import Laporan from './pages/Laporan';
import Pengaturan from './pages/Pengaturan';
import Grafik from './pages/Grafik';

import AnalitikDetail from './pages/analitik/AnalitikDetail';
import AmountAnalitik from './pages/analitik/AmountAnalitik';
import FeeAnalitik from './pages/analitik/FeeAnalitik';

import MasterDataPage from './pages/master/MasterDataPage';

import UserManagement from './pages/admin/UserManagement';
import RoleManagement from './pages/admin/RoleManagement';

// Halaman yang belum dibuat (placeholder sementara)
const Placeholder = ({ title }) => <h4>{title} (belum dibuat)</h4>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* Upload & Data */}
            <Route path="upload" element={<UploadData />} />
            <Route path="upload/history" element={<UploadHistory />} />
            <Route path="transaksi" element={<DataTransaksi />} />

            {/* Analitik — route spesifik (amount, fee) WAJIB di atas route dinamis (:dimension) */}
            <Route path="analitik/grafik" element={<Grafik />} />
            <Route path="analitik/amount" element={<AmountAnalitik />} />
            <Route path="analitik/fee" element={<FeeAnalitik />} />
            <Route path="analitik/:dimension" element={<AnalitikDetail />} />

            {/* Laporan */}
            <Route path="laporan" element={<Laporan />} />

            {/* Master Data */}
            <Route path="master/:entity" element={<MasterDataPage />} />

            {/* Administrasi */}
            <Route path="admin/users" element={<UserManagement />} />
            <Route path="admin/roles" element={<RoleManagement />} />

            {/* Akun */}
            <Route path="profil" element={<Profil />} />
            <Route path="pengaturan" element={<Pengaturan />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;