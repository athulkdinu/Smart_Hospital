import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import DashboardBody from "./DashboardBody";
import DoctorDashboard from "./DoctorDashboard";
import PatientDashboard from "./PatientDashboard";
import AppointmentDashboard from "./AppointmentDashboard";
import DashboardHeader from "./DashboardHeader";
import TokenDashboard from "./TokenDashboard";

function AdminDashboard() {
    const [element, setElement] = useState("body")
    console.log(element)
    const renderComponent = () => {
        switch (element) {
            case "body":
                return <DashboardBody />
            case "patient":
                return <PatientDashboard />
            case "doctor":
                return <DoctorDashboard />
            case "appointments":
                return <AppointmentDashboard />
            case "tokens":
                return <TokenDashboard />
            default:
                return <DashboardBody />
        }
    }
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar setElement={setElement} />
            <div className="flex flex-col flex-1 overflow-y-auto">
                <DashboardHeader />
                <div className="p-4 mt-12">
                    {renderComponent()}
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
