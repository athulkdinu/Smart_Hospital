import React, { useState, useEffect, useRef } from "react";
// import axios from "axios"; // Uncomment for backend

// Mock data and fetch functions
const fetchPatients = async () => {
  return [
    { id: 1, token: 101, name: "Akhil K S", complaint: "Fever", status: "Pending" },
    { id: 2, token: 102, name: "Dinu M", complaint: "Headache", status: "Pending" },
    { id: 3, token: 103, name: "Meena T", complaint: "Routine Checkup", status: "Completed" },
    { id: 4, token: 104, name: "Rahul P", complaint: "Cold", status: "Pending" },
    { id: 5, token: 105, name: "Asha V", complaint: "Back Pain", status: "Completed" },
  ];
};

const patientHistories = {
  1: [{ date: "2025-10-20", note: "Mild fever", prescription: "Paracetamol 500mg" }],
  2: [{ date: "2025-10-18", note: "Migraine", prescription: "Ibuprofen 200mg" }],
  3: [{ date: "2025-09-25", note: "Checkup", prescription: "Vitamin D tabs" }],
  4: [{ date: "2025-09-05", note: "Cough", prescription: "Cough syrup" }],
  5: [{ date: "2025-08-15", note: "Back Pain", prescription: "Diclofenac Gel" }],
};

const appointmentsMock = [
  { time: "09:00 AM", name: "Akhil K S", status: "Completed" },
  { time: "10:00 AM", name: "Dinu M", status: "Pending" },
  { time: "11:30 AM", name: "Meena T", status: "Completed" },
  { time: "12:45 PM", name: "Rahul P", status: "Upcoming" },
];

export default function DoctorDashboard() {
  const [queue, setQueue] = useState([]);
  const [filteredQueue, setFilteredQueue] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("token");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPatient, setCurrentPatient] = useState(null);
  const [notes, setNotes] = useState("");
  const [stats, setStats] = useState({ completed: 0, skipped: 0, avgTime: 0 });
  const [appointments] = useState(appointmentsMock);
  const [showPrevPatients, setShowPrevPatients] = useState(false);
  const [searchPrev, setSearchPrev] = useState("");

  const startTimeRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchPatients();
      setQueue(data);
      setFilteredQueue(data);
    };
    loadData();
  }, []);

  useEffect(() => {
    const refresh = setInterval(async () => {
      const data = await fetchPatients();
      setQueue(data);
      applyFilters(data);
    }, 30000);
    return () => clearInterval(refresh);
  }, [sortBy, searchTerm, filterStatus]);

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
  };

  const getHistory = (id) => patientHistories[id] || [];

  const prevPatients = queue.filter((p) => p.status === "Completed");

  const filteredPrevPatients = prevPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchPrev.toLowerCase()) ||
      p.token.toString().includes(searchPrev)
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Doctor Dashboard</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowPrevPatients(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow"
          >
            View Previous Patients
          </button>
          <div className="text-sm text-gray-600">
            Logged in as <span className="font-medium">Dr. Meena George</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {[
          { label: "Pending", value: queue.filter((q) => q.status === "Pending").length, color: "blue" },
          { label: "Completed", value: stats.completed, color: "green" },
          { label: "Skipped", value: stats.skipped, color: "red" },
          { label: "Avg Time (min)", value: stats.avgTime.toFixed(1), color: "yellow" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-md p-5 text-center">
            <div className="text-gray-500">{s.label}</div>
            <div className={`text-3xl font-bold text-${s.color}-600 mt-2`}>{s.value}</div>
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
        <div className="col-span-1 bg-white rounded-2xl shadow-md p-6">
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
                    : "border-gray-200 bg-gray-50"
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

        {/* Current Patient */}
        <div className="col-span-2 bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-3">Current Patient</h2>
          {currentPatient ? (
            <>
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold text-lg">{currentPatient.name}</div>
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

              {/* History */}
              <div className="mt-5 bg-gray-50 p-3 rounded-xl">
                <h3 className="font-semibold mb-2">Previous Visits</h3>
                {getHistory(currentPatient.id).map((h, i) => (
                  <div key={i} className="text-sm text-gray-700">
                    <div>{h.date}</div>
                    <div>{h.note}</div>
                    <div className="text-xs italic text-gray-500">{h.prescription}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500">No patient selected.</p>
          )}
        </div>

        {/* Appointments */}
        <div className="col-span-1 bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-3">Today's Appointments</h2>
          <div className="space-y-3">
            {appointments.map((a, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-xl border">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-gray-500">{a.time}</div>
                  </div>
                  <div className="text-xs text-gray-600">{a.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Previous Patients Modal */}
      {/* {showPrevPatients && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-3/4 max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Previous Patients</h2>
              <button
                onClick={() => setShowPrevPatients(false)}
                className="text-gray-600 hover:text-gray-900 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="Search by name or token..."
              className="w-full p-2 border rounded-xl mb-4"
              value={searchPrev}
              onChange={(e) => setSearchPrev(e.target.value)}
            />

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3 border-b">Name</th>
                    <th className="text-left p-3 border-b">Token</th>
                    <th className="text-left p-3 border-b">Complaint</th>
                    <th className="text-left p-3 border-b">Last Visit</th>
                    <th className="text-left p-3 border-b">Prescription</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrevPatients.map((p) => {
                    const lastVisit = getHistory(p.id)[0];
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="p-3 border-b">{p.name}</td>
                        <td className="p-3 border-b">#{p.token}</td>
                        <td className="p-3 border-b">{p.complaint}</td>
                        <td className="p-3 border-b">{lastVisit?.date || "—"}</td>
                        <td className="p-3 border-b">
                          {lastVisit?.prescription || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )} */}
    </div> 
  );
}
