import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import AdminDashboard from './components/AdminDashboard'
import Sidebar from './components/Sidebar'
import DashboardHeader from './components/DashboardHeader'
import DashboardBody from './components/DashboardBody'
import PatientDashboard from './components/PatientDashboard'
import DoctorDashboard from './components/DoctorDashboard'
import AppointmentDashboard from './components/AppointmentDashboard'

function App() {

  return (
    <>
      <div className="flex gap-0">
        <Sidebar />
        <div className="flex-5">
          <DashboardHeader />
          <Routes>
            <Route path='/' element={<DashboardBody />} />
            <Route path='/patient' element={<PatientDashboard />} />
            <Route path='/doctor' element={<DoctorDashboard />} />
            <Route path='/admin' element={<AdminDashboard />} />
            <Route path='/appointments' element={<AppointmentDashboard/>} />
          </Routes>
          
        </div>
      </div>

    </>
  )
}

export default App
