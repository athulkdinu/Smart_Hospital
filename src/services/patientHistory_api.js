import commonAPI from "./commonAPI";
import BASEURL from "./serverURL";

// Add new patient history record
export const addPatientHistoryAPI = async (data) => {
  return await commonAPI("POST", `${BASEURL}/patienthistory`, data);
};

// Get all patient histories (for admin)
export const getAllPatientHistoryAPI = async () => {
  return await commonAPI("GET", `${BASEURL}/patienthistory`, {});
};

// Get histories for a specific patient by patientId
export const getPatientHistoryByPatientIdAPI = async (patientId) => {
  if (!patientId) return [];
  const response = await commonAPI("GET", `${BASEURL}/patienthistory?patientId=${patientId}`, {});
  
  // json-server sometimes wraps result in array of arrays → flatten safely
  const data = Array.isArray(response) ? response.flat() : [];
  
  // Extra safety: ensure only matching patientId (string comparison)
  return data.filter(h => String(h.patientId) === String(patientId));
};

// Get single history by ID
export const getPatientHistoryByIdAPI = async (id) => {
  return await commonAPI("GET", `${BASEURL}/patienthistory/${id}`, {});
};

// Update an existing history
export const updatePatientHistoryAPI = async (id, data) => {
  return await commonAPI("PUT", `${BASEURL}/patienthistory/${id}`, data);
};

// Delete a history record
export const deletePatientHistoryAPI = async (id) => {
  return await commonAPI("DELETE", `${BASEURL}/patienthistory/${id}`, {});
};