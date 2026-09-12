import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, RoleRoute } from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';

import Login from './pages/auth/Login';
import RegisterPatient from './pages/auth/RegisterPatient';
import RegisterDoctor from './pages/auth/RegisterDoctor';
import RegisterReceptionist from './pages/auth/RegisterReceptionist';
import ForgotPassword from './pages/auth/ForgotPassword';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctors from './pages/admin/ManageDoctors';
import ManageReceptionists from './pages/admin/ManageReceptionists';
import ManagePatients from './pages/admin/ManagePatients';
import ManageTokens from './pages/admin/ManageTokens';
import SubscriptionPlans from './pages/admin/SubscriptionPlans';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import WritePrescription from './pages/doctor/WritePrescription';
import SymptomChecker from './pages/doctor/SymptomChecker';

import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import RegisterPatientForm from './pages/receptionist/RegisterPatient';
import BookAppointment from './pages/receptionist/BookAppointment';
import PatientList from './pages/receptionist/PatientList';

import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';
import PatientProfile from './pages/common/PatientProfile';

const DashboardRedirect = () => {
  const { user } = useAuth();
  const routes = { admin: '/admin', doctor: '/doctor', receptionist: '/receptionist', patient: '/patient' };
  return <Navigate to={routes[user?.role] || '/login'} replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register/patient" element={<RegisterPatient />} />
          <Route path="/register/doctor" element={<RegisterDoctor />} />
          <Route path="/register/receptionist" element={<RegisterReceptionist />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

          <Route path="/admin" element={<RoleRoute roles={['admin']}><Layout /></RoleRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="patients" element={<ManagePatients />} />
            <Route path="patients/:id" element={<PatientProfile />} />
            <Route path="doctors" element={<ManageDoctors />} />
            <Route path="receptionists" element={<ManageReceptionists />} />
            <Route path="tokens" element={<ManageTokens />} />
            <Route path="subscriptions" element={<SubscriptionPlans />} />
          </Route>

          <Route path="/doctor" element={<RoleRoute roles={['doctor']}><Layout /></RoleRoute>}>
            <Route index element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="patients/:id" element={<PatientProfile />} />
            <Route path="prescriptions/new" element={<WritePrescription />} />
            <Route path="ai/symptoms" element={<SymptomChecker />} />
          </Route>

          <Route path="/receptionist" element={<RoleRoute roles={['receptionist']}><Layout /></RoleRoute>}>
            <Route index element={<ReceptionistDashboard />} />
            <Route path="patients" element={<PatientList />} />
            <Route path="patients/new" element={<RegisterPatientForm />} />
            <Route path="patients/:id" element={<PatientProfile />} />
            <Route path="appointments/new" element={<BookAppointment />} />
          </Route>

          <Route path="/patient" element={<RoleRoute roles={['patient']}><Layout /></RoleRoute>}>
            <Route index element={<PatientDashboard />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="prescriptions" element={<PatientPrescriptions />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}