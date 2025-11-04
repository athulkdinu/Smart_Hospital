import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AddPatientHistory,
  getAllAppoinments,
  getAllPatientHistory,
  getAllTockens,
} from "../services/doctor_api";
import PatientHistory from "../components/PatientHistoryModal";
import commonAPI from "../services/commonAPI";
import BASEURL from "../services/serverURL";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserDoctor,
  faClock,
  faPrescriptionBottleAlt,
  faNotesMedical,
  faStethoscope,
  faUserCheck,
  faUserTimes,
  faCalendarAlt,
  faHistory,
  faSearch,
  faArrowRight,
  faCheckCircle,
  faTimesCircle,
  faUser,
  faExclamationCircle,
  faCalendarCheck,
  faCalendarTimes,
  faUserClock,
  faUserSlash,
} from "@fortawesome/free-solid-svg-icons";

// API Helpers
const updateTokenStatus = async (id, updatedData) =>
  await commonAPI("PUT", `${BASEURL}/tokens/${id}`, updatedData);
const updateAppointmentStatus = async (id, updatedData) =>
  await commonAPI("PUT", `${BASEURL}/appointments/${id}`, updatedData);

const normalizePrescription = (pres) => {
  if (Array.isArray(pres)) return pres;
  if (pres && typeof pres === "object") {
    const lines = [];
    if (Array.isArray(pres.list)) lines.push(...pres.list);
    if (pres.note) lines.push(pres.note);
    return lines;
  }
  return [];
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patientHistory, setPatientHistory] = useState([]);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [disease, setDisease] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [newMedicine, setNewMedicine] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false); // For Next/Complete/Skip
  const startTimeRef = useRef(null);

  const loggedDoctor = JSON.parse(localStorage.getItem("user"));
  const doctorName = loggedDoctor?.name || "Doctor";
  const doctorId = loggedDoctor?.id || "";

  // === FETCH TOKENS WITH POLLING & SYNC ===
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

          // === Correctly compute pending tokens from queue ===
          const pending = filtered.filter(
            (t) => !t.status || t.status === "Pending"
          ).length;
          const completed = filtered.filter((t) => t.status === "Completed").length;
          const skipped = filtered.filter((t) => t.status === "Skipped").length;

          setStats((prev) => ({
            ...prev,
            pendingTokens: pending,
            completed,
            skipped,
          }));
        }
      } catch (e) {
        console.error("Error fetching tokens:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTokens();
    const interval = setInterval(fetchTokens, 3000);
    const onFocus = () => fetchTokens();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [doctorId, doctorName]);

  // === FETCH APPOINTMENTS ===
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const data = await getAllAppoinments();
        if (Array.isArray(data)) {
          const filtered = data.filter(
            (a) => a.doctorId == doctorId || a.doctorName === doctorName
          );
          setAppointments(filtered);

          const total = filtered.length;
          const completedAppts = filtered.filter((a) => a.status === "Completed").length;

          setStats((prev) => ({
            ...prev,
            totalAppointments: total,
            completedAppointments: completedAppts,
          }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchAppointments();
  }, [doctorId, doctorName]);

  // === FETCH PATIENT HISTORY ===
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

  // === STATS STATE ===
  const [stats, setStats] = useState({
    completed: 0,
    skipped: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    pendingTokens: 0,
  });

  // === DERIVE PENDING COUNT LOCALLY (for button & UI) ===
  const pendingCount = queue.filter(
    (p) => !p.status || p.status === "Pending"
  ).length;

  // === NEXT PATIENT - OPTIMISTIC + ERROR HANDLING ===
  const handleNext = async () => {
    const next = queue.find((p) => !p.status || p.status === "Pending");
    if (!next) {
      alert("No pending patients in queue.");
      return;
    }

    setActionLoading(true);
    setCurrentPatient(next);

    // Optimistic UI
    setQueue((prev) =>
      prev.map((p) =>
        p.id === next.id ? { ...p, status: "In-Progress" } : p
      )
    );
    startTimeRef.current = Date.now();

    try {
      await updateTokenStatus(next.id, { ...next, status: "In-Progress" });
    } catch (err) {
      console.error("Failed to update token:", err);
      // Revert on error
      setQueue((prev) =>
        prev.map((p) =>
          p.id === next.id ? { ...p, status: "Pending" } : p
        )
      );
      setCurrentPatient(null);
      alert("Failed to start consultation. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  // === ADD MEDICINE ===
  const handleAddMedicine = () => {
    if (!newMedicine.trim()) return;
    setMedicines((prev) => [...prev, newMedicine.trim()]);
    setNewMedicine("");
  };

  // === COMPLETE CONSULTATION ===
  const handleComplete = async () => {
    if (!currentPatient) return alert("No patient selected.");
    if (medicines.length === 0 && !notes.trim())
      return alert("Add at least one medicine or note.");

    setActionLoading(true);

    const payload = {
      patientId: currentPatient.patientId || currentPatient.id,
      patientName: currentPatient.patientName,
      doctorId,
      doctorName,
      disease: disease || "General Checkup",
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      prescription: {
        list: medicines,
        note: notes.trim(),
      },
    };

    try {
      await AddPatientHistory(payload);
      await updateTokenStatus(currentPatient.id, {
        ...currentPatient,
        status: "Completed",
      });

      // Refresh history
      const fresh = await getAllPatientHistory();
      if (Array.isArray(fresh)) {
        const filtered = fresh.filter(
          (h) => h.doctorId == doctorId || h.doctorName === doctorName
        );
        setPatientHistory(filtered);
      }

      alert("Prescription saved successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to save prescription.");
    } finally {
      setActionLoading(false);
    }

    // UI cleanup
    setCurrentPatient(null);
    setDisease("");
    setNotes("");
    setMedicines([]);
  };

  // === SKIP PATIENT ===
  const handleSkip = async () => {
    if (!currentPatient) return;

    setActionLoading(true);
    try {
      await updateTokenStatus(currentPatient.id, {
        ...currentPatient,
        status: "Skipped",
      });
    } catch (e) {
      console.error(e);
      alert("Failed to skip patient.");
    } finally {
      setActionLoading(false);
    }

    setCurrentPatient(null);
    setDisease("");
    setNotes("");
    setMedicines([]);
  };

  // === TOGGLE APPOINTMENT STATUS ===
  const handleToggleAppointment = async (appt) => {
    const newStatus = appt.status === "Pending" ? "Completed" : "Pending";
    try {
      await updateAppointmentStatus(appt.id, { ...appt, status: newStatus });
      setAppointments((prev) =>
        prev.map((a) => (a.id === appt.id ? { ...a, status: newStatus } : a))
      );
      
      // Update stats after appointment status change
      const updatedAppts = await getAllAppoinments();
      if (Array.isArray(updatedAppts)) {
        const filtered = updatedAppts.filter(
          (a) => a.doctorId == doctorId || a.doctorName === doctorName
        );
        const total = filtered.length;
        const completedAppts = filtered.filter((a) => a.status === "Completed").length;
        
        setStats((prev) => ({
          ...prev,
          totalAppointments: total,
          completedAppointments: completedAppts,
        }));
      }
    } catch (e) {
      console.error("Failed to update appointment:", e);
    }
  };

  // === STATUS BADGE ===
  const StatusBadge = ({ status }) => {
    const config = {
      "In-Progress": { bg: "bg-emerald-100", text: "text-emerald-700", icon: faStethoscope },
      Pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: faClock },
      Completed: { bg: "bg-green-100", text: "text-green-700", icon: faCheckCircle },
      Skipped: { bg: "bg-red-100", text: "text-red-700", icon: faTimesCircle },
    };
    const c = config[status] || config.Pending;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full ${c.bg} ${c.text} font-medium text-sm`}
      >
        <FontAwesomeIcon icon={c.icon} className="text-xs" />
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-cyan-50 to-teal-50">
      <Header patientName={doctorName} />
      <div className="flex-1 relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.15) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Floating Orbs */}
      <motion.div
        className="absolute rounded-full bg-emerald-300/20 blur-3xl w-96 h-96 -top-32 -left-32"
        animate={{ x: [0, 40, -30, 0], y: [0, 30, -20, 0] }}
        transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute rounded-full bg-cyan-300/20 blur-3xl w-[32rem] h-[32rem] -bottom-32 -right-32"
        animate={{ x: [0, -50, 35, 0], y: [0, -30, 15, 0] }}
        transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
      />

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Hero Header */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-emerald-100/50 bg-white/80 backdrop-blur-2xl p-8 shadow-2xl"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight flex items-center gap-3">
                <FontAwesomeIcon icon={faUserDoctor} className="text-emerald-600" />
                Dr. {doctorName}'s Dashboard
              </h1>
              <p className="mt-2 text-lg text-gray-700">Manage consultations, prescriptions, and appointments.</p>
            </div>
            <button
              onClick={() => navigate("/dr_profile")}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <FontAwesomeIcon icon={faUser} />
              Profile
            </button>
          </div>
        </motion.section>

        {/* Stats Cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          <motion.div whileHover={{ scale: 1.05, y: -5 }} className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="inline-block rounded-xl bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 mb-3">
              <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" /> Total
            </div>
            <div className="text-3xl font-extrabold text-slate-800">{stats.totalAppointments}</div>
            <p className="text-xs text-gray-500 mt-1">Appointments</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -5 }} className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="inline-block rounded-xl bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 mb-3">
              <FontAwesomeIcon icon={faCalendarCheck} className="mr-1" /> Done
            </div>
            <div className="text-3xl font-extrabold text-slate-800">{stats.completedAppointments}</div>
            <p className="text-xs text-gray-500 mt-1">Completed</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -5 }} className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="inline-block rounded-xl bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-700 mb-3">
              <FontAwesomeIcon icon={faUserClock} className="mr-1" /> Queue
            </div>
            <div className="text-3xl font-extrabold text-slate-800">{pendingCount}</div>
            <p className="text-xs text-gray-500 mt-1">Pending Tokens</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -5 }} className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="inline-block rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 mb-3">
              <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Done
            </div>
            <div className="text-3xl font-extrabold text-slate-800">{stats.completed}</div>
            <p className="text-xs text-gray-500 mt-1">Consultations</p>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05, y: -5 }} className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div className="inline-block rounded-xl bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 mb-3">
              <FontAwesomeIcon icon={faUserSlash} className="mr-1" /> Skipped
            </div>
            <div className="text-3xl font-extrabold text-slate-800">{stats.skipped}</div>
            <p className="text-xs text-gray-500 mt-1">Patients</p>
          </motion.div>
        </motion.section>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Patient Queue */}
          <motion.section
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-emerald-700 flex items-center gap-2">
                <FontAwesomeIcon icon={faClock} className="text-emerald-600" />
                Patient Queue
              </h3>
              <span className="text-xs font-medium text-emerald-600">
                {pendingCount} pending
              </span>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {queue.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No patients in queue</p>
              ) : (
                queue.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setCurrentPatient(p)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all hover:scale-[1.02] hover:shadow-md ${
                      p.status === "In-Progress"
                        ? "border-emerald-500 bg-emerald-50/70 shadow-sm"
                        : p.status === "Completed"
                        ? "border-green-500 bg-green-50/70"
                        : p.status === "Skipped"
                        ? "border-red-500 bg-red-50/70"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold text-emerald-700">#{p.tokenNumber}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(p.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900">{p.patientName}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">Issue:</span> {p.complaint || "General"}
                    </p>
                  </motion.div>
                ))
              )}
            </div>

            {/* Next Patient Button */}
            <button
              onClick={handleNext}
              disabled={actionLoading || pendingCount === 0}
              className={`
                mt-5 w-full rounded-xl font-semibold py-3 shadow-lg transition-all
                flex items-center justify-center gap-2 text-white
                ${actionLoading || pendingCount === 0
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600 hover:shadow-xl"
                }`}
            >
              {actionLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Starting…
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faArrowRight} />
                  Next Patient
                </>
              )}
            </button>
          </motion.section>

          {/* Current Consultation */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-5 rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-emerald-700 flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faStethoscope} className="text-emerald-600" />
              Current Consultation
            </h3>
            {currentPatient ? (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-slate-800">{currentPatient.patientName}</p>
                    <p className="text-sm text-gray-600">Token #{currentPatient.tokenNumber}</p>
                  </div>
                  <StatusBadge status={currentPatient.status || "Pending"} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faNotesMedical} className="mr-1" /> Diagnosis
                  </label>
                  <input
                    type="text"
                    value={disease}
                    onChange={(e) => setDisease(e.target.value)}
                    placeholder="e.g., Viral Fever"
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-emerald-100 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faPrescriptionBottleAlt} className="mr-1" /> Prescription
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newMedicine}
                      onChange={(e) => setNewMedicine(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddMedicine()}
                      placeholder="Add medicine"
                      className="flex-1 px-4 py-2.5 rounded-xl border-2 border-emerald-100 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                    <button
                      onClick={handleAddMedicine}
                      className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all"
                    >
                      Add
                    </button>
                  </div>
                  {medicines.length > 0 && (
                    <ul className="space-y-1 text-sm text-gray-700">
                      {medicines.map((m, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faCheckCircle} className="text-emerald-500 text-xs" />
                          {m}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FontAwesomeIcon icon={faNotesMedical} className="mr-1" /> Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional instructions..."
                    rows={3}
                    className="w-full p-3 rounded-xl border-2 border-emerald-100 bg-white/90 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    onClick={handleComplete}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {actionLoading ? "Saving..." : <><FontAwesomeIcon icon={faCheckCircle} /> Complete</>}
                  </button>
                  <button
                    onClick={handleSkip}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <FontAwesomeIcon icon={faTimesCircle} /> Skip
                  </button>
                </div>

                <PatientHistory
                  selectedPatient={currentPatient}
                  allHistory={patientHistory}
                  normalizePrescription={normalizePrescription}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FontAwesomeIcon icon={faUserCheck} className="text-4xl mb-3 text-emerald-300" />
                <p>Select a patient from the queue to begin</p>
              </div>
            )}
          </motion.section>

          {/* Appointments */}
          <motion.section
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-3 rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg"
          >
            <h3 className="text-xl font-bold text-emerald-700 flex items-center gap-2 mb-4">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-emerald-600" />
              Appointments
            </h3>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              {appointments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No upcoming appointments</p>
              ) : (
                appointments.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 hover:shadow-sm transition"
                  >
                    <p className="font-semibold text-gray-800">{a.patientName}</p>
                    <p className="text-xs text-gray-500">{a.date} • {a.time}</p>
                    <p className="text-sm text-gray-600 mt-1 italic">Issue: {a.issue}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          a.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {a.status}
                      </span>
                      <button
                        onClick={() => handleToggleAppointment(a)}
                        className={`text-xs px-3 py-1 rounded-lg transition-all font-medium ${
                          a.status === "Completed"
                            ? "bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
                            : "bg-green-200 text-green-800 hover:bg-green-300"
                        }`}
                      >
                        {a.status === "Completed" ? "Undo" : "Done"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.section>
        </div>
      </main>
      </div>
      <Footer />
    </div>
  );
}