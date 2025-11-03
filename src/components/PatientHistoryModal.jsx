import React from "react";

const PatientHistory = ({ selectedPatient, allHistory, normalizePrescription }) => {
  if (!selectedPatient) {
    return (
      <div className="text-gray-500 mt-4 italic">
        Select a patient to view their medical history.
      </div>
    );
  }

  const records = allHistory.filter((h) => h.patientId === selectedPatient.id);

  if (records.length === 0) {
    return (
      <div className="text-gray-500 mt-4 italic">
        No previous records found for {selectedPatient.name || selectedPatient.patientName}.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-indigo-700 mb-3">
        Patient History — {selectedPatient.name || selectedPatient.patientName}
      </h3>

      <div className="space-y-4">
        {records.map((rec) => {
          const lines = normalizePrescription(rec.prescription);
          const complaint = rec.complaint || rec.issue || "—";
          const disease = rec.disease || "Not specified";

          return (
            <div
              key={rec.id}
              className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">Date:</span>{" "}
                  {rec.date} — {rec.time}
                </p>
                <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                  {rec.doctorName ? `Dr. ${rec.doctorName}` : "Unknown Doctor"}
                </span>
              </div>

              <div className="text-sm text-gray-700 space-y-1">
                
                <p>
                  <strong>Disease / Diagnosis:</strong>{" "}
                  <span className="text-gray-800">{disease}</span>
                </p>
              </div>

              {lines.length > 0 && (
                <div className="mt-2">
                  <strong className="text-gray-800">Prescription:</strong>
                  <ul className="list-disc list-inside text-sm text-gray-700 mt-1 space-y-1">
                    {lines.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>
              )}

              {rec.prescription?.note && (
                <div className="mt-2 text-sm text-gray-700">
                  <strong>Doctor's Note:</strong>{" "}
                  <span className="italic">{rec.prescription.note}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PatientHistory;
