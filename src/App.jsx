import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import AdminDashboard from './components/AdminDashboard'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import DashboardBody from './components/DashboardBody'
import PatientDashboard from './components/PatientDashboard'
import DoctorDashboard from './components/DoctorDashboard'

function App() {

  return (
    <>
      <div className="flex gap-0">
        <Sidebar />
        <div className="flex-5">
          <Header />
          <Routes>
            <Route path='/' element={<DashboardBody />} />
            <Route path='/patient' element={<PatientDashboard />} />
            <Route path='/doctor' element={<DoctorDashboard />} />
            <Route path='/admin' element={<AdminDashboard />} />
          </Routes>
          
        </div>
      </div>

    </>
  )
}

export default App
