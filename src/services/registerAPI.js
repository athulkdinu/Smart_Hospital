// src/services/registerAPI.js
import axios from "axios";

const BASE_URL = "http://localhost:5000"; // backend port

// 🧩 Function to create a unique loginId like PAT002, PAT003, etc.
const generatePatientLoginId = async () => {
  const res = await axios.get(`${BASE_URL}/patients`);
  const count = res.data.length + 1;
  return `PAT${String(count).padStart(3, "0")}`;
};

// 🧩 Register a new patient
export const registerPatient = async (patientData) => {
  try {
    const loginId = await generatePatientLoginId();
    const response = await axios.post(`${BASE_URL}/patients`, {
      ...patientData,
      loginId,
    });
    return response.data;
  } catch (err) {
    console.error("Registration API Error:", err);
    throw err;
  }
};
