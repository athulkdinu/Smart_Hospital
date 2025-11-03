import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // 👈 ADDED THIS IMPORT
import {
  AddPatientHistory,
  getAllAppoinments,
  getAllPatientHistory,
  getAllTockens,
} from "../services/doctor_api";
import { updateToken } from "../services/tokenApi";
import PatientHistory from "../components/PatientHistoryModal";

const normalizePrescription = (pres) => {
  if (Array.isArray(pres)) return pres;
  if (pres && typeof pres === "object") {
    const lines = [];
    if (Array.isArray(pres.medicines)) lines.push(...pres.medicines);
    if (pres.notes) lines.push(pres.notes);
    return lines;
  }
  return [];
};

export default function DoctorDashboard() {
  const navigate = useNavigate(); // 👈 ADDED THIS LINE

  const [queue, setQueue] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patientHistory, setPatientHistory] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [newMedicine, setNewMedicine] = useState("");
  const [stats, setStats] = useState({ completed: 0, skipped: 0, avgTime: 0 });
  const [loading, setLoading] = useState(false);
  const startTimeRef = useRef(null);

  const loggedDoctor = JSON.parse(localStorage.getItem("user"));
  const doctorName = loggedDoctor?.name || "";
  const doctorId = loggedDoctor?.id || "";

  /* --------------------------------------------------------------
     ALL LOGIC UNCHANGED – same as before
  -------------------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;
    const fetchTokens = async () => {
      try {
        setLoading(true);
        const data = await getAllTockens();
        if (!cancelled && Array.isArray(data)) {
          const filtered = data.filter(
            (t) => t.doctorId == doctorId || t.doctorName === doctorName
          );
          setQueue(filtered);
        }
      } catch (e) {
        console.error("Error fetching tokens:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTokens();
    const onFocus = () => fetchTokens();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [doctorId, doctorName]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getAllAppoinments();
        if (Array.isArray(data)) {
          const filtered = data.filter(
            (a) => a.doctorId == doctorId || a.doctorName === doctorName
          );
          setAppointments(filtered);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchAppointments();
  }, [doctorId, doctorName]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getAllPatientHistory();
        if (Array.isArray(data)) {
          const filtered = data.filter(
            (h) => h.doctorId == doctorId || h.doctorName === doctorName
          );
          setPatientHistory(filtered);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchHistory();
  }, [doctorId, doctorName]);

  const handleNext = () => {
    const next = queue.find((p) => p.status === "Pending" || !p.status);
    if (!next) return alert("No pending patients.");
    setCurrentPatient(next);
    setQueue((prev) =>
      prev.map((p) =>
        p.id === next.id ? { ...p, status: "In-Progress" } : p
      )
    );
    startTimeRef.current = Date.now();
  };

  const handleAddMedicine = () => {
    if (!newMedicine.trim()) return;
    setMedicines([...medicines, newMedicine.trim()]);
    setNewMedicine("");
  };

  const handleComplete = async () => {
    if (!currentPatient) return alert("Select a patient first.");
    if (medicines.length === 0 && !notes.trim())
      return alert("Add at least one medicine or note.");

    const timeTaken = (Date.now() - (startTimeRef.current || 0)) / 60000;
    setStats((prev) => ({
      completed: prev.completed + 1,
      skipped: prev.skipped,
      avgTime:
        (prev.avgTime * prev.completed + timeTaken) / (prev.completed + 1),
    }));

    const payload = {
      patientId: currentPatient.id,
      patientName: currentPatient.patientName || currentPatient.name,
      complaint: currentPatient.complaint,
      doctorId,
      doctorName,
      date: new Date().toISOString().split("T")[0],
      time: new Date()
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        .replace(/ /g, ""),
      prescription: [...medicines, notes].filter(Boolean),
    };

    try {
      await AddPatientHistory(payload);
      const fresh = await getAllPatientHistory();
      if (Array.isArray(fresh)) setPatientHistory(fresh);
      alert("Prescription saved!");
    } catch (e) {
      console.error(e);
      alert("Failed to save.");
    }

    setQueue((prev) =>
      prev.map((p) =>
        p.id === currentPatient.id ? { ...p, status: "Completed" } : p
      )
    );
    setCurrentPatient(null);
    setNotes("");
    setMedicines([]);
  };

  const handleSkip = () => {
    if (!currentPatient) return;
    setStats((prev) => ({ ...prev, skipped: prev.skipped + 1 }));
    setQueue((prev) =>
      prev.map((p) =>
        p.id === currentPatient.id ? { ...p, status: "Skipped" } : p
      )
    );
    setCurrentPatient(null);
    setNotes("");
    setMedicines([]);
  };

  /* --------------------------------------------------------------
     UI – **EXACT SAME** but with Profile button added
  -------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-6">
      {/* Header – 👈 PROFILE BUTTON ADDED HERE */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            Logged in as{" "}
            <span className="font-medium text-indigo-700">{doctorName || "Unknown Doctor"}</span>
          </div>
          {/* 👈 NEW PROFILE BUTTON */}
          <button
            onClick={() => navigate("/dr_profile")}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </button>
        </div>
      </div>

      {/* Grid – EXACT SAME */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-6">
        {/* ── QUEUE ── (unchanged) */}
        <div className="lg:col-span-1 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2m-4 0H9m0 0V6m0 12v-6m0 0H5a2 2 0 01-2-2V8a2 2 0 012-2h4" />
            </svg>
            Patient Queue
          </h2>

          <div className="space-y-3 overflow-y-auto h-[70vh] pr-1">
            {queue.map((p) => (
              <div
                key={p.id}
                onClick={() => setCurrentPatient(p)}
                className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${
                  p.status === "In-Progress"
                    ? "border-indigo-500 bg-indigo-50/70 shadow-sm"
                    : p.status === "Completed"
                    ? "border-green-500 bg-green-50/70"
                    : p.status === "Skipped"
                    ? "border-red-500 bg-red-50/70"
                    : "border-gray-300 bg-white"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      p.status === "In-Progress"
                        ? "bg-indigo-200 text-indigo-800"
                        : p.status === "Completed"
                        ? "bg-green-200 text-green-800"
                        : p.status === "Skipped"
                        ? "bg-red-200 text-red-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    #{p.tokenNumber}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(p.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="font-semibold text-gray-900 text-lg">{p.patientName}</div>
                <div className="text-sm text-indigo-600 font-medium">Dr. {p.doctorName}</div>

                <div className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Cause:</span>{" "}
                  {p.complaint || "General Checkup"}
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">ID: {p.patientId}</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    Date: {new Date(p.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleNext}
            className="mt-5 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Next Patient
          </button>
        </div>

        {/* ── CURRENT PATIENT + PRESCRIPTION ── (unchanged) */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Patient</h2>

          {currentPatient ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="font-semibold text-lg">{currentPatient.name}</div>
                  <div className="text-sm text-gray-500">
                    Complaint: {currentPatient.complaint}
                  </div>
                </div>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                  {currentPatient.status}
                </span>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-700">Add Prescription</h4>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMedicine}
                    onChange={(e) => setNewMedicine(e.target.value)}
                    placeholder="Enter medicine..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                  />
                  <button
                    onClick={handleAddMedicine}
                    className="bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition"
                  >
                    Add
                  </button>
                </div>

                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {medicines.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>

                <textarea
                  placeholder="Enter doctor's notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl h-28 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                />
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={handleComplete}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-xl shadow hover:bg-green-700 transition"
                >
                  Complete
                </button>
                <button
                  onClick={handleSkip}
                  className="bg-red-600 text-white px-6 py-2.5 rounded-xl shadow hover:bg-red-700 transition"
                >
                  Skip
                </button>
              </div>

              <PatientHistory
                selectedPatient={currentPatient}
                allHistory={patientHistory}
                normalizePrescription={normalizePrescription}
              />
            </>
          ) : (
            <p className="text-gray-500 italic">No patient selected.</p>
          )}
        </div>

        {/* ── UPCOMING APPOINTMENTS ── (unchanged) */}
        <div className="lg:col-span-1 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>

          <div className="space-y-3 overflow-y-auto h-[70vh]">
            {appointments.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:shadow-sm transition"
              >
                <div className="font-medium text-gray-800">{a.patientName}</div>
                <div className="text-xs text-gray-500">{a.patientEmail}</div>
                <div className="mt-1 text-sm text-gray-600">
                  {a.date} — {a.time}
                </div>
                <div className="text-sm text-indigo-600">Dr. {a.doctorName}</div>
                <div className="text-sm text-gray-600 italic mt-1">
                  Issue: {a.issue}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}