import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserMd, faStethoscope, faHospital, faCircleCheck, faEnvelope, faPhone, faPen, faCheck, faXmark, faTrash, } from "@fortawesome/free-solid-svg-icons";
import { getAllDoctorAPI, updateDoctorApi, deleteDoctorApi, } from "../services/allAPI";

const DoctorDashboard = () => {
    const [doctors, setDoctors] = useState([]);
    const [editDoctorId, setEditDoctorId] = useState(null);
    const [editedData, setEditedData] = useState({});

    // ✅ Fetch all doctors
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

    // ✅ Enable edit mode
    const handleEditClick = (doctor) => {
        setEditDoctorId(doctor.id);
        setEditedData({ ...doctor });
    };

    // ✅ Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedData((prev) => ({ ...prev, [name]: value }));
    };

    // ✅ Handle availability toggle
    const handleToggleAvailability = () => {
        setEditedData((prev) => ({
            ...prev,
            available: !prev.available,
        }));
    };

    // ✅ Save edited doctor using updateDoctorApi
    const handleSave = async () => {
        try {
            const response = await updateDoctorApi(editDoctorId, editedData);
            if (response.status >= 200 && response.status < 300) {
                alert("Doctor details updated successfully!");
                setEditDoctorId(null);
                fetchDoctors();
            }
        } catch (error) {
            console.error("Error updating doctor:", error);
            alert("Failed to update doctor details!");
        }
    };

    // ✅ Cancel edit mode
    const handleCancel = () => {
        setEditDoctorId(null);
        setEditedData({});
    };

    // ✅ Delete doctor
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this doctor?")) return;
        try {
            const response = await deleteDoctorApi(id);
            if (response.status >= 200 && response.status < 300) {
                alert("Doctor deleted successfully!");
                fetchDoctors();
            }
        } catch (error) {
            console.error("Error deleting doctor:", error);
            alert("Failed to delete doctor!");
        }
    };

    if (!doctors.length) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-500">
                Loading doctor details...
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 bg-gray-100 min-h-screen text-gray-800">
            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center sm:text-left">
                Doctor Dashboard
            </h2>

            {/* Doctor Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {doctors.map((doctor) => (
                    <div
                        key={doctor.id}
                        className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
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
                                    <p className="text-gray-500 text-sm">ID: {doctor.loginId}</p>
                                </div>
                            </div>

                            {/* Buttons */}
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
                        <div className="space-y-4 text-sm sm:text-base">
                            {/* Department */}
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faHospital} className="text-indigo-500" />
                                {editDoctorId === doctor.id ? (
                                    <input
                                        type="text"
                                        name="department"
                                        value={editedData.department}
                                        onChange={handleChange}
                                        className="border-b border-gray-300 focus:outline-none text-gray-600 w-full"
                                    />
                                ) : (
                                    <span className="text-gray-600 font-medium">
                                        {doctor.department}
                                    </span>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faStethoscope} className="text-green-500" />
                                {editDoctorId === doctor.id ? (
                                    <input
                                        type="text"
                                        name="tags"
                                        value={editedData.tags?.join(", ") || ""}
                                        onChange={(e) =>
                                            setEditedData((prev) => ({
                                                ...prev,
                                                tags: e.target.value.split(",").map((t) => t.trim()),
                                            }))
                                        }
                                        className="border-b border-gray-300 focus:outline-none text-gray-600 w-full"
                                    />
                                ) : (
                                    <span className="text-gray-600">
                                        {doctor.tags?.join(", ") || "General"}
                                    </span>
                                )}
                            </div>

                            {/* Availability */}
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faCircleCheck} className="text-yellow-500" />
                                {editDoctorId === doctor.id ? (
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editedData.available}
                                            onChange={handleToggleAvailability}
                                            className="w-5 h-5 accent-green-500"
                                        />
                                        <span
                                            className={`font-medium ${editedData.available ? "text-green-600" : "text-red-600"
                                                }`}
                                        >
                                            {editedData.available ? "Available" : "Not Available"}
                                        </span>
                                    </label>
                                ) : (
                                    <span
                                        className={`font-medium ${doctor.available ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {doctor.available ? "Available" : "Not Available"}
                                    </span>
                                )}
                            </div>

                            {/* Email */}
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faEnvelope} className="text-purple-500" />
                                {editDoctorId === doctor.id ? (
                                    <input
                                        type="text"
                                        name="email"
                                        value={editedData.email}
                                        onChange={handleChange}
                                        className="border-b border-gray-300 focus:outline-none text-gray-600 w-full"
                                    />
                                ) : (
                                    <span>{doctor.email || "N/A"}</span>
                                )}
                            </div>

                            {/* Phone */}
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
        </div>
    );
};

export default DoctorDashboard;
