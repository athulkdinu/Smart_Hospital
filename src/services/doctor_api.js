import commonAPI from "./commonAPI";
import BASEURL from "./serverURL";

// ✅ Fetch all tokens
export const getAllTockens = async () =>
  await commonAPI("GET", `${BASEURL}/tocken`, {});

// ✅ Fetch all appointments
export const getAllAppoinments = async () =>
  await commonAPI("GET", `${BASEURL}/appointments`, {});

// ✅ Add a patient's history (fixed missing parameter)
export const AddPatientHistory = async (data) =>
  await commonAPI("POST", `${BASEURL}/patienthistory`, data);

// ✅ Get all patient history
export const getAllPatientHistory = async () =>
  await commonAPI("GET", `${BASEURL}/patienthistory`, {});
