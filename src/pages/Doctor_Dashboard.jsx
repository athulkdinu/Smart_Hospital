import React, { useState, useEffect, useRef } from "react";
import "./doctorDashboard.css";
import {
  AddPatientHistory,
  getAllAppoinments,
  getAllPatientHistory,
  getAllTockens,
} from "../services/doctor_api";
import PatientHistory from "../components/PatientHistoryModal"; // Make sure this file exists!

// Helper – turn any prescription shape into an array of strings
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

  // Fetch tokens (queue)
  useEffect(() => {
    let cancelled = false;
    const fetchTokens = async () => {
      try {
        setLoading(true);
        const data = await getAllTockens();
        if (!cancelled && Array.isArray(data)) setQueue(data);
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
  }, []);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getAllAppoinments();
        if (Array.isArray(data)) setAppointments(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAppointments();
  }, []);

  // Fetch patient history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getAllPatientHistory();
        if (Array.isArray(data)) setPatientHistory(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchHistory();
  }, []);

  // Next patient
  const handleNext = () => {
    const next = queue.find((p) => p.status === "Pending");
    if (!next) return alert("No pending patients.");
    setCurrentPatient(next);
    setQueue((prev) =>
      prev.map((p) => (p.id === next.id ? { ...p, status: "In-Progress" } : p))
    );
    startTimeRef.current = Date.now();
  };

  // Add medicine
  const handleAddMedicine = () => {
    if (!newMedicine.trim()) return;
    setMedicines([...medicines, newMedicine.trim()]);
    setNewMedicine("");
  };

  // Complete consultation
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

    // Save as ARRAY of strings (matches DB)
    const payload = {
      patientId: currentPatient.id,
      patientName: currentPatient.name,
      complaint: currentPatient.complaint,
      doctorName: "Dr. Meena George",
      date: new Date().toISOString().split("T")[0],
      time: new Date()
        .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        .replace(/ /g, ""),
      prescription: [...medicines, notes].filter(Boolean), // Array!
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

  // Skip patient
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

  return (
    <div className="min-h-screen bg-gray-100 p-6 fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
        <div className="text-sm text-gray-600">
          Logged in as <span className="font-medium">Dr. Meena George</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Queue */}
        <div className="col-span-1 card fadeIn p-6">
          <h2 className="text-lg font-semibold mb-3">Patient Queue</h2>
          <div className="space-y-3 overflow-y-auto h-[70vh]">
            {queue.map((p) => (
              <div
                key={p.id}
                onClick={() => setCurrentPatient(p)}
                className={`cursor-pointer p-3 rounded-xl border hover:shadow transition-all ${
                  p.status === "In-Progress"
                    ? "border-indigo-400 bg-indigo-50"
                    : p.status === "Completed"
                    ? "border-green-300 bg-green-50"
                    : p.status === "Skipped"
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium text-gray-800">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.complaint}</div>
                  </div>
                  <div className="text-sm text-gray-600">#{p.token}</div>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleNext}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl shadow"
          >
            Next Patient
          </button>
        </div>

        {/* Current Patient + History */}
        <div className="col-span-2 card fadeIn p-6">
          <h2 className="text-xl font-semibold mb-3">Current Patient</h2>
          {currentPatient ? (
            <>
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold text-lg">
                    {currentPatient.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Complaint: {currentPatient.complaint}
                  </div>
                </div>
                <div className="text-sm px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                  {currentPatient.status}
                </div>
              </div>

              {/* Prescription Entry */}
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Add Prescription
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMedicine}
                    onChange={(e) => setNewMedicine(e.target.value)}
                    placeholder="Enter medicine..."
                    className="flex-1 border rounded-lg px-3 py-2"
                  />
                  <button
                    onClick={handleAddMedicine}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                  >
                    Add
                  </button>
                </div>

                <ul className="mt-3 list-disc list-inside text-sm text-gray-700">
                  {medicines.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>

                <textarea
                  placeholder="Enter doctor's notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full mt-4 p-3 border border-gray-300 rounded-xl h-28"
                />
              </div>

              <div className="flex justify-end gap-3 mt-3">
                <button
                  onClick={handleComplete}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl shadow"
                >
                  Complete
                </button>
                <button
                  onClick={handleSkip}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl shadow"
                >
                  Skip
                </button>
              </div>

              {/* Pass data to PatientHistory */}
              <PatientHistory
                selectedPatient={currentPatient}
                allHistory={patientHistory}
                normalizePrescription={normalizePrescription}
              />
            </>
          ) : (
            <p className="text-gray-500">No patient selected.</p>
          )}
        </div>

        {/* Appointments */}
        <div className="col-span-1 card fadeIn p-6">
          <h2 className="text-lg font-semibold mb-3">Upcoming Appointments</h2>
          <div className="space-y-3 overflow-y-auto h-[70vh]">
            {appointments.map((a) => (
              <div key={a.id} className="p-3 rounded-xl border bg-white shadow-sm">
                <div className="font-medium text-gray-800">{a.patientName}</div>
                <div className="text-xs text-gray-500">{a.patientEmail}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {a.date} — {a.time}
                </div>
                <div className="text-sm text-gray-600">
                  Doctor: {a.doctorName}
                </div>
                <div className="text-sm text-gray-600 italic">
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