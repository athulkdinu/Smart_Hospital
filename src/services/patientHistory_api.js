import commonAPI from "./commonAPI";
import BASEURL from "./serverURL";

// ✅ Get all histories for one patient
export const getPatientHistoryByPatientIdAPI = async (patientId) => {
  try {
    const url = `${BASEURL}/patienthistory?patientId=${patientId}`;
    const response = await commonAPI("GET", url);
    return response;
  } catch (error) {
    console.error("Error fetching patient history:", error);
    return [];
  }
};

// ✅ Add new record
export const addPatientHistoryAPI = async (data) => {
  try {
    const url = `${BASEURL}/patienthistory`;
    return await commonAPI("POST", url, data);
  } catch (error) {
    console.error("Error adding patient history:", error);
    return null;
  }
};

// ✅ Update existing record
export const updatePatientHistoryAPI = async (id, updatedData) => {
  try {
    const url = `${BASEURL}/patienthistory/${id}`;
    return await commonAPI("PUT", url, updatedData);
  } catch (error) {
    console.error("Error updating patient history:", error);
    return null;
  }
};

// ✅ Delete a record
export const deletePatientHistoryAPI = async (id) => {
  try {
    const url = `${BASEURL}/patienthistory/${id}`;
    return await commonAPI("DELETE", url);
  } catch (error) {
    console.error("Error deleting patient history:", error);
    return null;
  }
};
