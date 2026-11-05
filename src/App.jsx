import { Route, Routes } from 'react-router-dom'
import Header from './components/Header/Header'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import Landing from './pages/Landing/Landing'
import Login from './pages/Login/Login'
import AdminDashboard from './pages/AdminDashboard/AdminDashboard'
import EmployeeHome from './pages/EmployeeHome/EmployeeHome'
import ApplyRole from './pages/ApplyRole/ApplyRole'
import NotFound from './pages/NotFound/NotFound'

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee"
          element={
            <ProtectedRoute role="employee">
              <EmployeeHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/apply/:roleId"
          element={
            <ProtectedRoute role="employee">
              <ApplyRole />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
