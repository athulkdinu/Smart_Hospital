import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllTockens,
  getAllAppoinments,
  getAllPatientHistory,
} from "../services/doctor_api";

/* --------------------------------------------------------------
   Helper – format time without any external library
   -------------------------------------------------------------- */
const formatTime = (isoString) => {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/* --------------------------------------------------------------
   Main Component
   -------------------------------------------------------------- */
const DrProfilePage = () => {
  const navigate = useNavigate();

  /* ---------- 1. Auth & Doctor Info ---------- */
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (!storedUser || storedUser.role !== "doctor") {
    navigate("/login");
    return null;
  }

  const doctorId = storedUser.id;
  const doctorName = storedUser.name || "Dr. Unknown";
  const specialization = storedUser.specialization || "General Medicine";

  /* ---------- 2. State ---------- */
  const [tokens, setTokens] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- 3. Date helpers ---------- */
  const todayISO = new Date().toISOString().split("T")[0];
  const weekAgoISO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  /* ---------- 4. Fetch data ---------- */
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

  /* ---------- 5. Filter by doctor ---------- */
  const doctorTokens = tokens.filter((t) => t.doctorId == doctorId);
  const doctorAppointments = appointments.filter((a) => a.doctorId == doctorId);
  const doctorHistory = history.filter((h) => h.doctorId == doctorId);

  /* ---------- 6. Today / Week / All-time ---------- */
  const todayTokens = doctorTokens.filter((t) => t.date === todayISO);
  const todayAppointments = doctorAppointments.filter((a) => a.date === todayISO);
  const todayCheckups = doctorHistory.filter((h) => h.date === todayISO);

  const weekTokens = doctorTokens.filter((t) => t.date >= weekAgoISO);
  const weekAppointments = doctorAppointments.filter((a) => a.date >= weekAgoISO);
  const weekCheckups = doctorHistory.filter((h) => h.date >= weekAgoISO);

  const totalPatients = new Set(doctorTokens.map((t) => t.patientId)).size;
  const totalCheckups = doctorHistory.length;

  /* ---------- 7. Stats object ---------- */
  const stats = {
    today: {
      appointments: todayAppointments.length,
      checkups: todayCheckups.length,
      patients: new Set(todayTokens.map((t) => t.patientId)).size,
    },
    week: {
      appointments: weekAppointments.length,
      checkups: weekCheckups.length,
      patients: new Set(weekTokens.map((t) => t.patientId)).size,
    },
    allTime: {
      patients: totalPatients,
      checkups: totalCheckups,
      tokens: doctorTokens.length,
    },
  };

  /* ---------- 8. Progress percentages ---------- */
  const progress = {
    completionRate:
      doctorAppointments.length > 0
        ? Math.round(
            (doctorAppointments.filter((a) => a.status === "Completed").length /
              doctorAppointments.length) *
              100
          )
        : 0,
    tokenEfficiency:
      doctorTokens.length > 0
        ? Math.round(
            (doctorTokens.filter((t) => t.status === "Completed").length /
              doctorTokens.length) *
              100
          )
        : 0,
  };

  /* ---------- 9. Recent Activity (last 5) ---------- */
  const recentActivity = [
    ...doctorHistory.map((h) => ({ ...h, type: "checkup" })),
    ...doctorTokens.map((t) => ({
      ...t,
      type: "token",
      time: t.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.time || b.date) - new Date(a.time || a.date))
    .slice(0, 5);

  /* ---------- 10. Loading UI ---------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-xl font-medium text-indigo-600 animate-pulse">
          Loading Profile...
        </div>
      </div>
    );
  }

  /* ---------- 11. Main Render ---------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/80 hover:shadow-md transition-all"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            My Professional Dashboard
          </h1>
        </div>
        <p className="text-gray-600 mt-1">
          Track your performance, patients, and progress
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* ---------- LEFT: Doctor Card + Progress ---------- */}
        <div className="lg:col-span-1 space-y-6">
          {/* Doctor Card */}
          <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-white/30">
            <div className="text-center">
              <div className="w-28 h-28 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {doctorName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <h2 className="mt-4 text-2xl font-bold text-gray-800">
                {doctorName}
              </h2>
              <p className="text-indigo-600 font-semibold text-lg">
                {specialization}
              </p>
              <p className="text-sm text-gray-500 mt-1">Doctor ID: {doctorId}</p>
            </div>

            <div className="mt-8 space-y-4">
              {/* Completion Rate */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl">
                <div className="text-sm text-gray-600">Appointment Completion</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${progress.completionRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-indigo-700">
                    {progress.completionRate}%
                  </span>
                </div>
              </div>

              {/* Token Efficiency */}
              <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-xl">
                <div className="text-sm text-gray-600">Token Efficiency</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-green-500 to-teal-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${progress.tokenEfficiency}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-green-700">
                    {progress.tokenEfficiency}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Summary */}
          <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-6 border border-white/30">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Today's Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-xl">
                <span className="text-sm text-indigo-700 font-medium">
                  Appointments
                </span>
                <span className="text-xl font-bold text-indigo-800">
                  {stats.today.appointments}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                <span className="text-sm text-green-700 font-medium">
                  Check-ups
                </span>
                <span className="text-xl font-bold text-green-800">
                  {stats.today.checkups}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                <span className="text-sm text-purple-700 font-medium">
                  Patients Seen
                </span>
                <span className="text-xl font-bold text-purple-800">
                  {stats.today.patients}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- CENTER: Performance Overview ---------- */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-6 border border-white/30">
            <h3 className="text-lg font-semibold text-gray-800 mb-5">
              Performance Overview
            </h3>

            {/* This Week */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl">
                <div className="text-2xl font-bold text-indigo-800">
                  {stats.week.appointments}
                </div>
                <div className="text-xs text-indigo-600 mt-1">
                  Appointments (Week)
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                <div className="text-2xl font-bold text-green-800">
                  {stats.week.checkups}
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Check-ups (Week)
                </div>
              </div>
            </div>

            {/* All Time */}
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                <div>
                  <div className="text-sm text-purple-600">Total Patients</div>
                  <div className="text-2xl font-bold text-purple-800">
                    {stats.allTime.patients}
                  </div>
                </div>
                <svg
                  className="w-8 h-8 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>

              <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl">
                <div>
                  <div className="text-sm text-teal-600">
                    Total Consultations
                  </div>
                  <div className="text-2xl font-bold text-teal-800">
                    {stats.allTime.checkups}
                  </div>
                </div>
                <svg
                  className="w-8 h-8 text-teal-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-6 border border-white/30">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Quick Navigation
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/doctor")} // your dashboard route
                className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-xl transition-all flex items-center justify-between"
              >
                <span>Go to Dashboard</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>

              <button
                onClick={() => navigate("/appointments")}
                className="w-full text-left p-3 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-xl transition-all flex items-center justify-between"
              >
                <span>Manage Appointments</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ---------- RIGHT: Recent Activity ---------- */}
        <div className="lg:col-span-1">
          <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-6 border border-white/30 h-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {recentActivity.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No recent activity
                </p>
              ) : (
                recentActivity.map((act, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        act.type === "checkup"
                          ? "bg-green-500"
                          : "bg-indigo-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">
                        {act.type === "checkup"
                          ? act.disease
                          : `Token #${act.tokenNumber}`}
                      </p>
                      <p className="text-xs text-gray-600">
                        {act.patientName} •{" "}
                        {act.type === "checkup"
                          ? act.time
                          : formatTime(act.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrProfilePage;