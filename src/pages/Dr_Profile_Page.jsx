import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  getAllTockens,
  getAllAppoinments,
  getAllPatientHistory,
  getDoctorById,
} from "../services/doctor_api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserDoctor,
  faCheckCircle,
  faUserSlash,
  faStethoscope,
  faPrescriptionBottleAlt,
  faUsers,
  faFileMedical,
  faChartLine,
  faPills,
  faHeartbeat,
  faNotesMedical,
} from "@fortawesome/free-solid-svg-icons";

/* ---------- Date / Time display helpers (exact match to payload) ---------- */
const displayDate = (dateStr) => dateStr || "—";   // e.g. "2025-04-12"
const displayTime = (timeStr) => timeStr || "—";   // e.g. "02:30 PM"

/* ---------- Group-by-date helper ---------- */
const groupByDate = (items, dateKey) => {
  return items.reduce((acc, item) => {
    const date = item[dateKey]?.split("T")[0];
    if (date) acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
};

const DrProfilePage = () => {
  const navigate = useNavigate();

  // ----- Auth -----
  const storedUser = JSON.parse(localStorage.getItem("user"));
  if (!storedUser || storedUser.role !== "doctor") {
    navigate("/login");
    return null;
  }

  const doctorId = storedUser.id;
  const [doctor, setDoctor] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // ----- Fetch data -----
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [docRes, tRes, aRes, hRes] = await Promise.all([
          getDoctorById(doctorId),
          getAllTockens(),
          getAllAppoinments(),
          getAllPatientHistory(),
        ]);

        setDoctor(docRes?.data || docRes);
        setTokens(Array.isArray(tRes) ? tRes : tRes?.data || []);
        setAppointments(Array.isArray(aRes) ? aRes : aRes?.data || []);
        setHistory(Array.isArray(hRes) ? hRes : hRes?.data || []);
      } catch (err) {
        console.error("API error", err);
        alert("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [doctorId]);

  // ----- Filter by doctor -----
  const doctorTokens = tokens.filter((t) => t.doctorId == doctorId);
  const doctorAppointments = appointments.filter((a) => a.doctorId == doctorId);
  const doctorHistory = history.filter((h) => h.doctorId == doctorId);

  // ----- Stats -----
  const totalPatientsSeen = new Set(doctorTokens.map((t) => t.patientId)).size;
  const totalTokensIssued = doctorTokens.length;
  const consultationsCompleted = doctorTokens.filter((t) => t.status === "Completed").length;
  const tokensSkipped = doctorTokens.filter((t) => t.status === "Skipped").length;

  const totalMedicinesPrescribed = doctorHistory.reduce((sum, h) => {
    const meds = Array.isArray(h.prescription?.list) ? h.prescription.list : h.prescription?.list || [];
    return sum + meds.length;
  }, 0);

  // last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const last30Checkups = doctorHistory.filter((h) => h.date >= thirtyDaysAgo);
  const avgPatientsPerDay = last30Checkups.length > 0 ? (last30Checkups.length / 30).toFixed(1) : "0.0";

  // peak day
  const checkupsByDate = groupByDate(doctorHistory, "date");
  const peakDayEntry = Object.entries(checkupsByDate).sort((a, b) => b[1] - a[1])[0];
  const peakConsultationDay = peakDayEntry
    ? `${peakDayEntry[0]} (${peakDayEntry[1]} patients)`
    : "No data";

  // top disease
  const diseaseFreq = doctorHistory.reduce((acc, h) => {
    const d = h.disease?.trim() || "General Checkup";
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  const topDiseaseEntry = Object.entries(diseaseFreq).sort((a, b) => b[1] - a[1])[0];
  const mostFrequentDisease = topDiseaseEntry
    ? `${topDiseaseEntry[0]} (${topDiseaseEntry[1]} cases)`
    : "N/A";

  // progress
  const appointmentRate =
    doctorAppointments.length > 0
      ? Math.round(
          (doctorAppointments.filter((a) => a.status === "Completed").length /
            doctorAppointments.length) *
            100
        )
      : 0;

  const tokenEfficiency =
    totalTokensIssued > 0
      ? Math.round((consultationsCompleted / totalTokensIssued) * 100)
      : 0;

  // ----- Patient History (sorted newest first) -----
  const sortedPatientHistory = [...doctorHistory]
    .sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.time || "").localeCompare(a.time || ""));

  // ----- Loading UI -----
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-cyan-50 to-teal-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const doctorName = doctor?.name || storedUser.name || "Dr. Unknown";
  const specialization = doctor?.specialization || storedUser.specialization || "General Medicine";

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
          {/* Hero */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-emerald-100/50 bg-white/80 backdrop-blur-2xl p-8 shadow-2xl"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight flex items-center gap-3">
                  <FontAwesomeIcon icon={faUserDoctor} className="text-emerald-600" />
                  Dr. {doctorName}
                </h1>
                <p className="mt-2 text-lg text-gray-700">
                  {specialization} • ID: {doctorId}
                </p>
              </div>
              <button
                onClick={() => navigate("/doctor")}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <FontAwesomeIcon icon={faStethoscope} />
                Go to Dashboard
              </button>
            </div>
          </motion.section>

          {/* Stats Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            {[
              { icon: faUsers, label: "Total Patients Seen", value: totalPatientsSeen, color: "emerald" },
              { icon: faFileMedical, label: "Tokens Issued", value: totalTokensIssued, color: "cyan" },
              { icon: faCheckCircle, label: "Completed", value: consultationsCompleted, color: "green" },
              { icon: faUserSlash, label: "Skipped", value: tokensSkipped, color: "red" },
              { icon: faPills, label: "Medicines Given", value: totalMedicinesPrescribed, color: "teal" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-5 shadow-lg hover:shadow-xl transition-all text-center"
                title={stat.label}
              >
                <div className={`inline-block rounded-xl bg-${stat.color}-100 px-2 py-1 text-xs font-semibold text-${stat.color}-700 mb-2`}>
                  <FontAwesomeIcon icon={stat.icon} className="mr-1" />
                  {stat.label}
                </div>
                <div className="text-2xl font-extrabold text-slate-800">{stat.value}</div>
              </motion.div>
            ))}
          </motion.section>

          {/* Progress + Patient History */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Efficiency & Insights */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1 space-y-5"
            >
              <div className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-emerald-700 mb-4 flex items-center gap-2">
                  <FontAwesomeIcon icon={faChartLine} /> Efficiency
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Appointment Rate</span>
                      <span className="font-bold">{appointmentRate}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${appointmentRate}%` }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Token Efficiency</span>
                      <span className="font-bold">{tokenEfficiency}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${tokenEfficiency}%` }}
                        className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-emerald-700 mb-3 flex items-center gap-2">
                  <FontAwesomeIcon icon={faHeartbeat} /> Key Insights
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Avg Patients/Day (30d)</span>
                    <span className="font-bold text-emerald-700">{avgPatientsPerDay}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Peak Day</span>
                    <span className="font-bold text-emerald-700 text-xs">{peakConsultationDay}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Top Diagnosis</span>
                    <span className="font-bold text-emerald-700">{mostFrequentDisease}</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Patient History */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 rounded-2xl border border-emerald-100/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faFileMedical} /> Patient History
                <span className="text-sm font-medium text-emerald-600 ml-auto">
                  {sortedPatientHistory.length} records
                </span>
              </h3>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {sortedPatientHistory.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No patient history found</p>
                ) : (
                  sortedPatientHistory.map((h, i) => (
                    <motion.div
                      key={h.id || i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-800">{h.patientName}</p>
                          <p className="text-xs text-gray-600">
                            {displayDate(h.date)} • {displayTime(h.time)}
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                          {h.disease || "General Checkup"}
                        </span>
                      </div>

                      {/* Prescription */}
                      {h.prescription && (
                        <div className="mt-3 pt-3 border-t border-emerald-200">
                          <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                            <FontAwesomeIcon icon={faPills} className="text-emerald-600" />
                            <span className="font-medium">Prescription:</span>
                          </div>
                          {Array.isArray(h.prescription.list) && h.prescription.list.length > 0 ? (
                            <ul className="list-disc list-inside text-xs text-gray-600 space-y-0.5">
                              {h.prescription.list.slice(0, 3).map((med, idx) => (
                                <li key={idx}>{med}</li>
                              ))}
                              {h.prescription.list.length > 3 && (
                                <li className="text-gray-500 italic">
                                  +{h.prescription.list.length - 3} more...
                                </li>
                              )}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-500 italic">No medicines listed</p>
                          )}
                          {h.prescription.note && (
                            <p className="text-xs text-gray-600 mt-2 italic">
                              <FontAwesomeIcon icon={faNotesMedical} className="mr-1" />
                              "{h.prescription.note}"
                            </p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default DrProfilePage;