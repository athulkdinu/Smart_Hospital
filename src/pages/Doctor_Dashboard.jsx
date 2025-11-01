import React, { useState, useEffect, useRef } from "react";
import "./doctorDashboard.css";
import { getAllAppoinments, getAllTockens } from "../services/doctor_api";

export default function DoctorDashboard() {
  const [queue, setQueue] = useState([]);
  const [filteredQueue, setFilteredQueue] = useState([]);
  const [appointments, setAppointments] = useState([]); // ✅ fixed missing state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("token");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPatient, setCurrentPatient] = useState(null);
  const [notes, setNotes] = useState("");
  const [stats, setStats] = useState({ completed: 0, skipped: 0, avgTime: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPrevPatients, setShowPrevPatients] = useState(false);
  const [searchPrev, setSearchPrev] = useState("");

  const startTimeRef = useRef(null);

  // ✅ Fetch tokens (patients)
  useEffect(() => {
    let cancelled = false;

    const fetchTokens = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getAllTockens();
        if (!cancelled) {
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((d) => ({
              id: d.id,
              name: d.name,
              token: d.token,
              complaint: d.complaint,
              status: d.status,
            }));
            setQueue(mapped);
          } else {
            setError("No tokens found. Please check your backend data.");
          }
        }
      } catch (e) {
        if (!cancelled) {
          console.error("Error fetching tokens:", e);
          setError("Failed to load tokens from backend.");
        }
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

  // ✅ Fetch appointments
useEffect(() => {
  let cancelled = false;

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllAppoinments();
      if (!cancelled) {
        if (Array.isArray(data) && data.length > 0) {
          // map according to the new structure
          const mapped = data.map((d) => ({
            id: d.id,
            patientId: d.patientId,
            patientName: d.patientName,
            patientEmail: d.patientEmail,
            doctorId: d.doctorId,
            doctorName: d.doctorName,
            date: d.date,
            time: d.time,
            issue: d.issue,
          }));
          console.log("Appointments:", mapped);
          // Store this in a new state
          setAppointments(mapped);
        } else {
          setError(
            "No appointments found. Please check if the backend is running on http://localhost:3000"
          );
        }
      }
    } catch (e) {
      if (!cancelled) {
        console.error("Fetch appointments error:", e);
        setError(
          "Failed to load appointments. Please check if the backend server is running."
        );
      }
    } finally {
      if (!cancelled) setLoading(false);
    }
  };

  fetchAppointments();
  const onFocus = () => fetchAppointments();
  window.addEventListener("focus", onFocus);

  return () => {
    cancelled = true;
    window.removeEventListener("focus", onFocus);
  };
}, []);


  // ✅ Filtering, sorting, searching
  const applyFilters = (list = queue) => {
    let result = [...list];

    if (filterStatus !== "All") {
      result = result.filter((q) => q.status === filterStatus);
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (q) =>
          q.name.toLowerCase().includes(term) ||
          q.token.toString().includes(term)
      );
    }

    if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "token") result.sort((a, b) => a.token - b.token);
    if (sortBy === "status") result.sort((a, b) => a.status.localeCompare(b.status));

    setFilteredQueue(result);
  };

  useEffect(() => {
    applyFilters();
  }, [searchTerm, sortBy, filterStatus, queue]);

  // ✅ Actions
  const handleNext = () => {
    const next = queue.find((p) => p.status === "Pending");
    if (!next) return alert("No pending patients.");
    setCurrentPatient(next);
    setQueue((prev) =>
      prev.map((p) =>
        p.id === next.id ? { ...p, status: "In-Progress" } : p
      )
    );
    startTimeRef.current = Date.now();
  };

  const handleComplete = () => {
    if (!currentPatient) return;
    const timeTaken = (Date.now() - startTimeRef.current) / 60000;
    setStats((prev) => ({
      completed: prev.completed + 1,
      skipped: prev.skipped,
      avgTime:
        (prev.avgTime * prev.completed + timeTaken) / (prev.completed + 1),
    }));
    setQueue((prev) =>
      prev.map((p) =>
        p.id === currentPatient.id ? { ...p, status: "Completed" } : p
      )
    );
    setCurrentPatient(null);
    setNotes("");
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
  };

  const prevPatients = queue.filter((p) => p.status === "Completed");
  const filteredPrevPatients = prevPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchPrev.toLowerCase()) ||
      p.token.toString().includes(searchPrev)
  );

  const statClassFromColor = (color) =>
    `stat${color.charAt(0).toUpperCase() + color.slice(1)}`;

  return (
    <div className="min-h-screen bg-gray-100 p-6 fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowPrevPatients(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow btn"
          >
            View Previous Patients
          </button>
          <div className="text-sm text-gray-600">
            Logged in as <span className="font-medium">Dr. Meena George</span>
          </div>
        </div>
      </div>

      {/* Loading/Error */}
      {loading && <p className="text-blue-600 mb-4">Loading data...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {[
          {
            label: "Pending",
            value: queue.filter((q) => q.status === "Pending").length,
            color: "blue",
          },
          { label: "Completed", value: stats.completed, color: "green" },
          { label: "Skipped", value: stats.skipped, color: "red" },
          {
            label: "Avg Time (min)",
            value: stats.avgTime.toFixed(1),
            color: "yellow",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-md p-5 text-center fadeIn"
          >
            <div className="text-gray-500">{s.label}</div>
            <div
              className={`text-3xl font-bold ${statClassFromColor(s.color)} mt-2`}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name or token..."
          className="flex-1 p-2 rounded-xl border border-gray-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="p-2 border rounded-xl"
        >
          <option value="token">Sort by Token</option>
          <option value="name">Sort by Name</option>
          <option value="status">Sort by Status</option>
        </select>
        <div className="flex gap-2">
          {["All", "Pending", "Completed", "Skipped"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-xl border ${
                filterStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-4 gap-6">
        {/* Queue */}
        <div className="col-span-1 card fadeIn p-6">
          <h2 className="text-lg font-semibold mb-3">Patient Queue</h2>
          <div className="space-y-3 overflow-y-auto h-[70vh]">
            {filteredQueue.map((p) => (
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
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl shadow btn"
          >
            Next Patient
          </button>
        </div>

        {/* Current Patient */}
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
                    Token #{currentPatient.token}
                  </div>
                  <div className="text-sm text-gray-500">
                    Complaint: {currentPatient.complaint}
                  </div>
                </div>
                <div className="text-sm px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                  {currentPatient.status}
                </div>
              </div>

              <textarea
                placeholder="Enter notes / prescription..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full mt-4 p-3 border border-gray-300 rounded-xl h-28"
              />

              <div className="flex justify-end gap-3 mt-3">
                <button
                  onClick={handleComplete}
                  className="bg-green-600 text-white px-4 py-2 rounded-xl shadow btn"
                >
                  Complete
                </button>
                <button
                  onClick={handleSkip}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl shadow btn"
                >
                  Skip
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No patient selected.</p>
          )}
        </div>

        {/* Appointments Section */}
        <div className="col-span-1 card fadeIn p-6">
  <h2 className="text-lg font-semibold mb-3">Upcoming Appointments</h2>
  {appointments.length === 0 ? (
    <p className="text-gray-500 text-center">No appointments found.</p>
  ) : (
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
  )}
</div>
      </div>
    </div>
  );
}
