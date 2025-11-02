import React from "react";

const PatientHistory = ({ selectedPatient, allHistory, normalizePrescription }) => {
  if (!selectedPatient) {
    return <div className="text-gray-500 mt-4">Select a patient to view history.</div>;
  }

  const records = allHistory.filter((h) => h.patientId === selectedPatient.id);

  if (records.length === 0) {
    return (
      <div className="text-gray-500 mt-4">
        No previous records found for {selectedPatient.name}.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-blue-600 mb-3">
        Previous History for {selectedPatient.name}
      </h3>

      {records.map((rec) => {
        const lines = normalizePrescription(rec.prescription);
        const complaint = rec.complaint || rec.issue || "—";

        return (
          <div
            key={rec.id}
            className="bg-gray-50 p-4 rounded-lg mb-3 border border-gray-200"
          >
            <p className="font-medium">
              <strong>Date:</strong> {rec.date} at {rec.time}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <strong>Complaint:</strong> {complaint}
            </p>

            {lines.length > 0 && (
              <div className="mt-2">
                <strong>Prescription:</strong>
                <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                  {lines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PatientHistory;