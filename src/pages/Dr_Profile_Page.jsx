import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllTockens,
  getAllAppoinments,
  getAllPatientHistory,
} from "../services/doctor_api";

const DrProfilePage = () => {
  const navigate = useNavigate();

  // -----------------------------------------------------------------
  // 1. Get logged-in doctor from localStorage
  // -----------------------------------------------------------------
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (!storedUser || storedUser.role !== "doctor") {
    navigate("/login");
    return null;
  }

  const doctorId = storedUser.id;
  const doctorName = storedUser.name || "Dr. Unknown";
  const specialization = storedUser.specialization || "General";

  // -----------------------------------------------------------------
  // 2. API data + today’s stats
  // -----------------------------------------------------------------
  const [tokens, setTokens] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayISO = new Date().toISOString().split("T")[0]; // "2025-11-02"

  // Load all data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tRes, aRes, hRes] = await Promise.all([
          getAllTockens(),
          getAllAppoinments(),
          getAllPatientHistory(),
        ]);

        setTokens(tRes.data || []);
        setAppointments(aRes.data || []);
        setHistory(hRes.data || []);
      } catch (err) {
        console.error("API error", err);
        alert("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ---- Today’s stats ------------------------------------------------
  const todayTokens = tokens.filter(
    (t) => t.doctorId === doctorId && t.date === todayISO
  );
  const todayAppointments = appointments.filter(
    (a) => a.doctorId == doctorId && a.date === todayISO
  );
  const todayHistory = history.filter(
    (h) => h.doctorId == doctorId && h.date === todayISO
  );

  const stats = {
    appointments: todayAppointments.length,
    checkups: todayHistory.length,
    patients: new Set(todayTokens.map((t) => t.patientId)).size,
  };

  // -----------------------------------------------------------------
  // 3. Render
  // -----------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-indigo-600 animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-6">
      {/* ----- Header ----- */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white hover:shadow-md transition-all"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        </div>
        <p className="text-gray-600 mt-1">View your details and today's activity</p>
      </div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* ----- LEFT: Doctor Info (Read-only) ----- */}
        <div className="lg:col-span-2">
          <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-white/20">
            {/* Doctor Name & Specialization */}
            <div className="text-center mb-8">
              <div className="w-28 h-28 mx-auto bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {doctorName.split(" ").map((n) => n[0]).join("")}
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-800">{doctorName}</h2>
              <p className="text-indigo-600 font-medium text-lg">{specialization}</p>
            </div>

            {/* Info Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-sm text-gray-500">Doctor ID</div>
                <div className="font-semibold text-gray-800">{doctorId}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-sm text-gray-500">Role</div>
                <div className="font-semibold text-gray-800 capitalize">{storedUser.role}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ----- RIGHT: Stats + Quick Actions ----- */}
        <div className="space-y-6">
          {/* Today’s Stats */}
          <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Today’s Activity
            </h3>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-4 rounded-xl">
                <div className="text-2xl font-bold text-indigo-800">{stats.appointments}</div>
                <div className="text-xs text-indigo-600">Appointments</div>
              </div>

              <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl">
                <div className="text-2xl font-bold text-green-800">{stats.checkups}</div>
                <div className="text-xs text-green-600">Check-ups</div>
              </div>

              <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-xl">
                <div className="text-2xl font-bold text-purple-800">{stats.patients}</div>
                <div className="text-xs text-purple-600">Patients</div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/appointments")}
                className="w-full flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-3 px-4 rounded-xl transition-all"
              >
                <span>View Appointments</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => navigate("/queue")}
                className="w-full flex items-center justify-between bg-green-50 hover:bg-green-100 text-green-700 font-medium py-3 px-4 rounded-xl transition-all"
              >
                <span>Patient Queue</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => navigate("/patient_history")}
                className="w-full flex items-center justify-between bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-3 px-4 rounded-xl transition-all"
              >
                <span>Patient History</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrProfilePage;