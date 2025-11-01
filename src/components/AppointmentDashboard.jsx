import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faClock,
  faUserDoctor,
  faUserInjured,
  faEdit,
  faTrash,
  faSave,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  getAllAppointmentAPI,
  getAllPatientAPI,
  getAllDoctorAPI,
  updateAppointmentApi,
  deleteAppointmentAPI,
} from "../services/allAPI";

const AppointmentDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [editAppointment, setEditAppointment] = useState(null);

  // ✅ Fetch all data
  const fetchAllData = async () => {
    try {
      const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
        getAllAppointmentAPI(),
        getAllPatientAPI(),
        getAllDoctorAPI(),
      ]);

      if (appointmentsRes.status === 200) setAppointments(appointmentsRes.data);
      if (patientsRes.status === 200) setPatients(patientsRes.data);
      if (doctorsRes.status === 200) setDoctors(doctorsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ✅ Helper functions to get names
  const getPatientName = (id) =>
    patients.find((p) => p.id === id)?.name || "Unknown";

  const getDoctorName = (id) =>
    doctors.find((d) => d.id === id)?.name || "Unknown";

  // ✅ Delete Appointment
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?"))
      return;
    try {
      await deleteAppointmentAPI(id);
      fetchAllData();
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  // ✅ Save Updated Appointment
  const handleSaveEdit = async () => {
    try {
      await updateAppointmentApi(editAppointment.id, editAppointment);
      setEditAppointment(null);
      fetchAllData();
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  if (!appointments.length) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-gray-800">
      <h2 className="text-2xl font-semibold mb-6">Appointment Dashboard</h2>

      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="min-w-full text-sm sm:text-base">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">#</th>
              <th className="py-3 px-4 text-left">
                <FontAwesomeIcon icon={faUserInjured} className="mr-2" /> Patient
              </th>
              <th className="py-3 px-4 text-left">
                <FontAwesomeIcon icon={faUserDoctor} className="mr-2" /> Doctor
              </th>
              <th className="py-3 px-4 text-left">
                <FontAwesomeIcon icon={faCalendarDays} className="mr-2" /> Date
              </th>
              <th className="py-3 px-4 text-left">
                <FontAwesomeIcon icon={faClock} className="mr-2" /> Time
              </th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {appointments.map((appt, index) => (
              <tr
                key={appt.id}
                className="border-b hover:bg-gray-50 transition-all"
              >
                <td className="py-3 px-4">{index + 1}</td>
                <td className="py-3 px-4">{getPatientName(appt.patientId)}</td>
                <td className="py-3 px-4">{getDoctorName(appt.doctorId)}</td>
                <td className="py-3 px-4">{appt.date}</td>
                <td className="py-3 px-4">{appt.time}</td>
                <td className="py-3 px-4 text-center space-x-3">
                  <button
                    onClick={() => setEditAppointment(appt)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </button>
                  <button
                    onClick={() => handleDelete(appt.id)}
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

      {/* ✅ Edit Modal */}
      {editAppointment && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              onClick={() => setEditAppointment(null)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>

            <h3 className="text-lg font-semibold mb-4 text-center">
              Edit Appointment
            </h3>

            <div className="space-y-3">
              <select
                value={editAppointment.patientId}
                onChange={(e) =>
                  setEditAppointment({
                    ...editAppointment,
                    patientId: parseInt(e.target.value),
                  })
                }
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <select
                value={editAppointment.doctorId}
                onChange={(e) =>
                  setEditAppointment({
                    ...editAppointment,
                    doctorId: parseInt(e.target.value),
                  })
                }
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={editAppointment.date}
                onChange={(e) =>
                  setEditAppointment({
                    ...editAppointment,
                    date: e.target.value,
                  })
                }
                className="w-full p-2 border rounded-lg"
              />

              <input
                type="text"
                value={editAppointment.time}
                onChange={(e) =>
                  setEditAppointment({
                    ...editAppointment,
                    time: e.target.value,
                  })
                }
                placeholder="Time (e.g. 10:00 AM)"
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

export default AppointmentDashboard;
