import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserMd,
  faHospital,
  faCircleCheck,
  faEnvelope,
  faPhone,
  faPen,
  faCheck,
  faXmark,
  faTrash,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import {
  getAllDoctorAPI,
  updateDoctorApi,
  deleteDoctorApi,
  addDoctorApi,
} from "../services/allAPI";

const DoctorDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [editDoctorId, setEditDoctorId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    name: "",
    specialization: "",
    available: true,
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await getAllDoctorAPI();
      if (response.status === 200) setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctor data:", error);
    }
  };

  // ------------------ EDIT ------------------
  const handleEditClick = (doctor) => {
    setEditDoctorId(doctor.id);
    setEditedData({ ...doctor });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleAvailability = () => {
    setEditedData((prev) => ({
      ...prev,
      available: !prev.available,
    }));
  };

  const handleSave = async () => {
    try {
      const response = await updateDoctorApi(editDoctorId, editedData);
      if (response.status >= 200 && response.status < 300) {
        alert("Doctor details updated successfully!");
        setEditDoctorId(null);
        fetchDoctors();
      }
    } catch {
      alert("Failed to update doctor details!");
    }
  };

  const handleCancel = () => {
    setEditDoctorId(null);
    setEditedData({});
  };

  // ------------------ DELETE ------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      const response = await deleteDoctorApi(id);
      if (response.status >= 200 && response.status < 300) {
        alert("Doctor deleted successfully!");
        fetchDoctors();
      }
    } catch {
      alert("Failed to delete doctor!");
    }
  };

  // ------------------ ADD ------------------
  const handleNewDoctorChange = (e) => {
    const { name, value } = e.target;
    setNewDoctor((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDoctor = async () => {
    try {
      const response = await addDoctorApi(newDoctor);
      if (response.status >= 200 && response.status < 300) {
        alert("New doctor added successfully!");
        setShowAddModal(false);
        setNewDoctor({
          name: "",
          specialization: "",
          available: true,
          email: "",
          phone: "",
        });
        fetchDoctors();
      }
    } catch {
      alert("Failed to add doctor!");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen text-gray-800">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold">Doctor Dashboard</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faPlus} /> Add Doctor
        </button>
      </div>

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 text-white w-14 h-14 flex items-center justify-center rounded-full text-2xl font-bold">
                  {doctor.name.charAt(0)}
                </div>
                <div>
                  {editDoctorId === doctor.id ? (
                    <input
                      type="text"
                      name="name"
                      value={editedData.name}
                      onChange={handleChange}
                      className="border-b border-gray-300 focus:outline-none text-lg font-semibold w-full"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FontAwesomeIcon icon={faUserMd} className="text-blue-500" />
                      {doctor.name}
                    </h3>
                  )}
                </div>
              </div>

              {/* Edit/Delete Buttons */}
              <div className="flex gap-3">
                {editDoctorId === doctor.id ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="text-green-600 hover:text-green-800"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditClick(doctor)}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                    <button
                      onClick={() => handleDelete(doctor.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 text-sm sm:text-base">
              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faHospital} className="text-indigo-500" />
                {editDoctorId === doctor.id ? (
                  <input
                    type="text"
                    name="specialization"
                    value={editedData.specialization}
                    onChange={handleChange}
                    className="border-b border-gray-300 focus:outline-none text-gray-600 w-full"
                  />
                ) : (
                  <span className="text-gray-600 font-medium">
                    {doctor.specialization || "N/A"}
                  </span>
                )}
              </div>

              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={editDoctorId === doctor.id ? handleToggleAvailability : undefined}
              >
                <FontAwesomeIcon icon={faCircleCheck} className="text-yellow-500" />
                <span
                  className={`font-medium ${
                    (editDoctorId === doctor.id
                      ? editedData.available
                      : doctor.available)
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(editDoctorId === doctor.id
                    ? editedData.available
                    : doctor.available)
                    ? "Available"
                    : "Not Available"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faEnvelope} className="text-purple-500" />
                {editDoctorId === doctor.id ? (
                  <input
                    type="email"
                    name="email"
                    value={editedData.email}
                    onChange={handleChange}
                    className="border-b border-gray-300 focus:outline-none text-gray-600 w-full"
                  />
                ) : (
                  <span>{doctor.email || "N/A"}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <FontAwesomeIcon icon={faPhone} className="text-pink-500" />
                {editDoctorId === doctor.id ? (
                  <input
                    type="text"
                    name="phone"
                    value={editedData.phone}
                    onChange={handleChange}
                    className="border-b border-gray-300 focus:outline-none text-gray-600 w-full"
                  />
                ) : (
                  <span>{doctor.phone || "N/A"}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-600"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
            <h3 className="text-xl font-semibold mb-4">Add New Doctor</h3>
            <div className="space-y-3">
              {[
                { name: "name", label: "Name" },
                { name: "specialization", label: "Specialization" },
                { name: "email", label: "Email" },
                { name: "phone", label: "Phone" },
              ].map((field) => (
                <input
                  key={field.name}
                  type="text"
                  name={field.name}
                  placeholder={field.label}
                  value={newDoctor[field.name]}
                  onChange={handleNewDoctorChange}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              ))}
              <button
                onClick={handleAddDoctor}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Add Doctor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
