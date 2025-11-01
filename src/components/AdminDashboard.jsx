import React from 'react'
import { Route, Routes } from "react-router-dom";
import Sidebar from './Sidebar'
import DashboardBody from './DashboardBody'
import DoctorDashboard from './DoctorDashboard'
import PatientDashboard from './PatientDashboard'
import AppointmentDashboard from './AppointmentDashboard'
import DashboardHeader from './DashboardHeader';

function AdminDashboard() {
    return (
        <>
            <div className="flex h-screen bg-gray-100 ">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-y-auto">
                    <DashboardHeader />
                    <div className="p-4  mt-12">
                        <Routes>
                            <Route path="/" element={<DashboardBody />} />
                            <Route path="/patient" element={<PatientDashboard />} />
                            <Route path="/doctor" element={<DoctorDashboard />} />
                            <Route path="/appointments" element={<AppointmentDashboard />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminDashboard