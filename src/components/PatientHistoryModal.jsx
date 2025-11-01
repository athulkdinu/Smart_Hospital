import React, { useState } from "react";

const mockHistory = [
  {
    id: 1,
    date: "2025-10-20",
    type: "Checkup",
    complaint: "Fever",
    notes: "Patient had mild fever and sore throat.",
    prescription: "Paracetamol 500mg, 3x/day for 3 days",
    followUp: "Return if fever persists",
    attachments: ["lab_report_1.pdf", "xray1.png"],
    vitals: { temp: "101°F", bp: "120/80", weight: "70kg" },
  },
  {
    id: 2,
    date: "2025-09-15",
    type: "Lab",
    complaint: "Routine Blood Test",
    notes: "Blood test done, all values normal.",
    prescription: "None",
    followUp: "Next routine checkup in 6 months",
    attachments: ["blood_test.pdf"],
    vitals: { temp: "98°F", bp: "118/76", weight: "70kg" },
  },
  {
    id: 3,
    date: "2025-08-10",
    type: "Follow-up",
    complaint: "Prescription Update",
    notes: "Updated medications for seasonal allergy.",
    prescription: "Cetirizine 10mg once daily",
    followUp: "Monitor allergy symptoms",
    attachments: [],
    vitals: { temp: "98.2°F", bp: "119/77", weight: "70kg" },
  },
];

const PatientHistoryModal = ({ patient, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  const filteredHistory = mockHistory
    .filter((h) => h.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((h) => filterType === "All" || h.type === filterType);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start overflow-auto py-10 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-3/4 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">{patient.name} - History</h2>
          <button
            className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search notes..."
            className="border p-2 rounded-lg flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border p-2 rounded-lg"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Checkup">Checkup</option>
            <option value="Lab">Lab</option>
            <option value="Follow-up">Follow-up</option>
          </select>
        </div>

        {/* Timeline */}
        <div className="flex flex-col gap-4">
          {filteredHistory.map((visit) => (
            <div
              key={visit.id}
              className="bg-gray-50 p-4 rounded-xl shadow hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{visit.date}</span>
                <span
                  className={`px-2 py-1 rounded-full text-sm font-medium ${
                    visit.type === "Checkup"
                      ? "bg-blue-100 text-blue-800"
                      : visit.type === "Lab"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {visit.type}
                </span>
              </div>

              <p>
                <span className="font-medium">Complaint:</span> {visit.complaint}
              </p>

              <p className="mt-1">
                <span className="font-medium">Notes:</span> {visit.notes}
              </p>

              <p className="mt-1">
                <span className="font-medium">Prescription:</span>{" "}
                {visit.prescription}{" "}
                {visit.prescription !== "None" && (
                  <button
                    onClick={() => handleCopy(visit.prescription)}
                    className="ml-2 text-blue-600 underline text-sm"
                  >
                    Copy
                  </button>
                )}
              </p>

              <p className="mt-1">
                <span className="font-medium">Follow-up:</span> {visit.followUp}
              </p>

              {/* Vitals */}
              <div className="mt-2 flex gap-4">
                {Object.entries(visit.vitals).map(([key, value]) => (
                  <span key={key} className="text-sm bg-white border px-2 py-1 rounded">
                    <span className="font-medium">{key}:</span> {value}
                  </span>
                ))}
              </div>

              {/* Attachments */}
              {visit.attachments.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {visit.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href="#"
                      className="text-blue-600 underline text-sm"
                      onClick={(e) => e.preventDefault()}
                    >
                      {file}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Export History */}
        <div className="mt-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Export History (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientHistoryModal;
