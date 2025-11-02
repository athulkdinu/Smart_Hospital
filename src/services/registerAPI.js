// src/services/registerAPI.js
import commonAPI from "./commonAPI";
import BASEURL from "./serverURL";

// 🧩 Generate a unique loginId like PAT001, PAT002, etc.
const generatePatientLoginId = async () => {
  const existingPatients = await commonAPI("GET", `${BASEURL}/patients`);
  const count = existingPatients.length + 1;
  return `PAT${String(count).padStart(3, "0")}`;
};

// 🧩 Register a new patient and store it in db.json
export const registerPatient = async (patientData) => {
  try {
    const loginId = await generatePatientLoginId();
    const newPatient = { ...patientData, loginId };
    const response = await commonAPI("POST", `${BASEURL}/patients`, newPatient);
    return response;
  } catch (err) {
    console.error("Registration API Error:", err);
    throw err;
  }
};
