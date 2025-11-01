import React, { useState } from "react";

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState({
    name: "Dr. Meena George",
    specialization: "Cardiologist",
    email: "meena@hospital.com",
    phone: "+91 98765 43210",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctor({ ...doctor, [name]: value });
  };

  const handleSave = () => {
    alert("Profile updated successfully!");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Doctor Profile</h1>

      <div className="bg-white shadow-md rounded-2xl p-6 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-600 mb-1">Name</label>
            <input
              name="name"
              value={doctor.name}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-gray-300"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Specialization</label>
            <input
              name="specialization"
              value={doctor.specialization}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-gray-300"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Email</label>
            <input
              name="email"
              value={doctor.email}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-gray-300"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">Phone</label>
            <input
              name="phone"
              value={doctor.phone}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-gray-300"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-600"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default DoctorProfile;
