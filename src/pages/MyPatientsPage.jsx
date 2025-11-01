import React, { useState } from "react";

// Mock data for patients and their history
const mockPatients = [
  {
    id: 1,
    name: "Akhil K S",
    tokenNo: 101,
    lastVisit: "2025-10-20",
    status: "Completed",
    history: [
      {
        date: "2025-10-20",
        doctor: "Dr. Meena",
        notes: "Mild fever",
        prescription: "Paracetamol 500mg",
      },
      {
        date: "2025-09-15",
        doctor: "Dr. Meena",
        notes: "Headache, Fatigue",
        prescription: "Rest, fluids",
      },
    ],
  },
  {
    id: 2,
    name: "Dinu M",
    tokenNo: 102,
    lastVisit: "2025-10-18",
    status: "Completed",
    history: [
      {
        date: "2025-10-18",
        doctor: "Dr. Meena",
        notes: "Routine checkup",
        prescription: "None",
      },
    ],
  },
];

const MyPatients = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = mockPatients.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedPatient(null);
    setShowModal(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Patients</h1>

      {/* Search Bar */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search by patient name..."
          className="flex-1 p-3 rounded-xl border border-gray-300 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-2 gap-6">
        {filteredPatients.map((patient) => (
          <div
            key={patient.id}
            className="bg-white shadow-md rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => openModal(patient)}
          >
            <h2 className="text-xl font-semibold mb-2">{patient.name}</h2>
            <p>
              <span className="font-medium">Token No:</span> {patient.tokenNo}
            </p>
            <p>
              <span className="font-medium">Last Visit:</span> {patient.lastVisit}
            </p>
            <p>
              <span className="font-medium">Status:</span>{" "}
              <span
                className={`px-2 py-1 rounded-full text-sm font-medium ${
                  patient.status === "Completed"
                    ? "bg-green-100 text-green-800"
                    : patient.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {patient.status}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Patient History Modal */}
      {showModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-2/3 max-h-[80vh] overflow-y-auto p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={closeModal}
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4">{selectedPatient.name} - History</h2>

            {selectedPatient.history.map((visit, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-4 shadow-inner mb-4"
              >
                <p>
                  <span className="font-medium">Date:</span> {visit.date}
                </p>
                <p>
                  <span className="font-medium">Doctor:</span> {visit.doctor}
                </p>
                <p>
                  <span className="font-medium">Notes:</span> {visit.notes}
                </p>
                <p>
                  <span className="font-medium">Prescription:</span> {visit.prescription}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPatients;
