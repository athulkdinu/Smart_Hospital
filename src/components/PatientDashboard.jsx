import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faCalendar,
  faUser,
  faEdit,
  faTrash,
  faTimes,
  faSave,
} from "@fortawesome/free-solid-svg-icons";
import {
  getAllPatientAPI,
  deletePatientAPI,
  updatePatientApi,
} from "../services/allAPI";

const PatientDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [editPatient, setEditPatient] = useState(null);

  // Fetch patients
  const fetchPatients = async () => {
    try {
      const response = await getAllPatientAPI();
      if (response.status === 200) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Delete patient
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      await deletePatientAPI(id);
      fetchPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

  // Save updated patient
  const handleSaveEdit = async () => {
    try {
      await updatePatientApi(editPatient.id, editPatient);
      setEditPatient(null);
      fetchPatients();
    } catch (error) {
      console.error("Error updating patient:", error);
    }
  };

  if (!patients.length) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading patient details...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-gray-800">
      <h2 className="text-2xl font-semibold mb-6">Patient Dashboard</h2>

      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="min-w-full text-sm sm:text-base">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">#</th>
              <th className="py-3 px-4 text-left">
                <FontAwesomeIcon icon={faUser} className="mr-2" /> Name
              </th>
              <th className="py-3 px-4 text-left">
                <FontAwesomeIcon icon={faCalendar} className="mr-2" /> Age
              </th>
              <th className="py-3 px-4 text-left">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" /> Address
              </th>
              <th className="py-3 px-4 text-left">
                <FontAwesomeIcon icon={faEnvelope} className="mr-2" /> Email
              </th>
              <th className="py-3 px-4 text-left">
                <FontAwesomeIcon icon={faPhone} className="mr-2" /> Phone
              </th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {patients.map((patient, index) => (
              <tr
                key={patient.id}
                className="border-b hover:bg-gray-50 transition-all"
              >
                <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4 font-medium text-gray-700">
                  {patient.name}
                </td>
                <td className="py-3 px-4">{patient.age}</td>
                <td className="py-3 px-4">{patient.address}</td>
                <td className="py-3 px-4 text-blue-600">{patient.email}</td>
                <td className="py-3 px-4">{patient.phone}</td>
                <td className="py-3 px-4 text-center space-x-3">
                  <button
                    onClick={() => setEditPatient(patient)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDelete(patient.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editPatient && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              onClick={() => setEditPatient(null)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <h3 className="text-lg font-semibold mb-4 text-center">
              Edit Patient
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                value={editPatient.name}
                onChange={(e) =>
                  setEditPatient({ ...editPatient, name: e.target.value })
                }
                placeholder="Name"
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="number"
                value={editPatient.age}
                onChange={(e) =>
                  setEditPatient({ ...editPatient, age: e.target.value })
                }
                placeholder="Age"
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                value={editPatient.address}
                onChange={(e) =>
                  setEditPatient({ ...editPatient, address: e.target.value })
                }
                placeholder="Address"
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="email"
                value={editPatient.email}
                onChange={(e) =>
                  setEditPatient({ ...editPatient, email: e.target.value })
                }
                placeholder="Email"
                className="w-full p-2 border rounded-lg"
              />
              <input
                type="text"
                value={editPatient.phone}
                onChange={(e) =>
                  setEditPatient({ ...editPatient, phone: e.target.value })
                }
                placeholder="Phone"
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleSaveEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" /> Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
