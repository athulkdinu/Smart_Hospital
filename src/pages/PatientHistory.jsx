import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getPatientHistoryByPatientIdAPI } from "../services/patientHistory_api";

const PatientHistory = () => {
  const [histories, setHistories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  // Get logged-in patient from localStorage
  const loggedInPatient = JSON.parse(localStorage.getItem("loggedPatient"));

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!loggedInPatient?.id) return;

        const data = await getPatientHistoryByPatientIdAPI(loggedInPatient.id);

        // Critical Fix: json-server returns [[]] or [] — flatten & filter safely
        const validData = Array.isArray(data)
          ? data.flat() // in case [[{...}]] → [{...}]
          : [];

        // Double-check: only keep records where patientId matches exactly
        const patientHistory = validData.filter(
          (h) => String(h.patientId) === String(loggedInPatient.id)
        );

        setHistories(patientHistory);
        setFiltered(patientHistory);
      } catch (error) {
        console.error("Error fetching patient history:", error);
        setHistories([]);
        setFiltered([]);
      }
    };

    fetchHistory();
  }, [loggedInPatient?.id]);

  // Search filter
  useEffect(() => {
    const s = search.toLowerCase();
    setFiltered(
      histories.filter(
        (h) =>
          h.patientName?.toLowerCase().includes(s) ||
          h.doctorName?.toLowerCase().includes(s) ||
          h.disease?.toLowerCase().includes(s)
      )
    );
  }, [search, histories]);

  // Rest of your UI (unchanged design)
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      {/* Floating Background Orbs */}
      <motion.div
        className="absolute w-96 h-96 bg-emerald-300/40 blur-3xl rounded-full -top-24 -left-16"
        animate={{ y: [0, 40, 0], x: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 12 }}
      />
      <motion.div
        className="absolute w-96 h-96 bg-teal-300/40 blur-3xl rounded-full -bottom-20 -right-16"
        animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 14 }}
      />

      {/* HEADER */}
      <div className="text-center py-20 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg relative z-10">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-extrabold drop-shadow-lg"
        >
          {loggedInPatient
            ? `${loggedInPatient.fullName}'s History`
            : "Patient History"}
        </motion.h1>
        <p className="mt-3 text-white/90 text-lg">
          Review your past consultations, prescriptions, and doctor notes
        </p>
      </div>

      {/* Search bar */}
      <div className="max-w-6xl mx-auto mt-10 px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search by doctor or disease..."
          className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-emerald-200 shadow-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <p className="text-emerald-700 font-medium">
          Showing {filtered.length} record(s)
        </p>
      </div>

      {/* Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 pb-28"
      >
        {filtered.map((h) => (
          <motion.div
            key={h.id}
            whileHover={{
              scale: 1.05,
              rotateY: 3,
              boxShadow: "0 8px 25px rgba(16, 185, 129, 0.35)",
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative bg-gradient-to-br from-white/70 to-emerald-50/60 backdrop-blur-lg border border-emerald-100 rounded-3xl p-6 overflow-hidden shadow-lg cursor-pointer group hover:text-white transition-all duration-300"
            onClick={() => setSelected(h)}
          >
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-emerald-400/50 via-teal-400/30 to-emerald-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ repeat: Infinity, duration: 6 }}
            ></motion.div>

            <div className="relative z-10 flex items-center gap-4 mb-4">
              <motion.div
                className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 rounded-2xl shadow-md"
                whileHover={{ rotate: 10 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 14l9-5-9-5-9 5 9 5z"
                  />
                </svg>
              </motion.div>
              <div>
                <h3 className="text-xl font-bold text-emerald-700 group-hover:text-white transition-colors">
                  {h.disease}
                </h3>
                <p className="text-gray-500 text-sm group-hover:text-gray-100 transition-colors">
                  {h.doctorName}
                </p>
              </div>
            </div>

            <div className="relative z-10 text-gray-600 text-sm space-y-1 group-hover:text-gray-100 transition-colors">
              <p>
                <strong>Date:</strong> {h.date}
              </p>
              <p>
                <strong>Time:</strong> {h.time}
              </p>
            </div>

            <motion.div className="absolute bottom-5 right-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300">
              View Details
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-32 text-gray-500"
        >
          <p className="text-xl">No history found for this patient</p>
        </motion.div>
      )}

      {/* Modal */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white/90 backdrop-blur-2xl rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-emerald-100 relative overflow-hidden"
          >
            <motion.div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-emerald-400/50 via-teal-400/30 to-emerald-400/50 opacity-70 animate-pulse"></motion.div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-emerald-700 mb-3">
                {selected.disease}
              </h2>
              <p className="text-gray-600">
                <strong>Doctor:</strong> {selected.doctorName}
              </p>
              <p className="text-gray-600">
                <strong>Date:</strong> {selected.date} at {selected.time}
              </p>
              <div className="mt-4 bg-emerald-50 p-4 rounded-xl shadow-inner">
                <h4 className="font-semibold text-emerald-700 mb-2">
                  Prescription:
                </h4>
                <ul className="list-disc list-inside">
                  {Array.isArray(selected.prescription?.list) &&
                    selected.prescription.list.map((item, i) => (
                      <li key={i} className="text-gray-700 text-sm">
                        {item}
                      </li>
                    ))}
                </ul>
                {selected.prescription?.note && (
                  <p className="text-gray-700 text-sm mt-2 italic">
                    <strong>Note:</strong> {selected.prescription.note}
                  </p>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelected(null)}
                className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PatientHistory;