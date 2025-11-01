import adminAPI from "./adminAPI"
import BASEURL from "./serverURL"

// ----------------- Doctor -----------------
export const addDoctorApi = async (data) => {
    return await adminAPI("POST", `${BASEURL}/doctors`, data)
}

export const getAllDoctorAPI = async () => {
    return await adminAPI("GET", `${BASEURL}/doctors`, {})
}

export const deleteDoctorApi = async (id) => {
    return await adminAPI("DELETE", `${BASEURL}/doctors/${id}`)
}

export const updateDoctorApi = async (id, doc) => {
    return await adminAPI('PUT', `${BASEURL}/doctors/${id}`, doc)
}


// ----------------- Patient -----------------

export const getAllPatientAPI = async () => {
    return await adminAPI("GET", `${BASEURL}/patients`, {})
}

export const updatePatientApi = async (id, data) => {
    return await adminAPI('PUT', `${BASEURL}/patients/${id}`, data)
}

export const deletePatientAPI = async (id) => {
    return await adminAPI("DELETE", `${BASEURL}/doctors/${id}`)
}


// ----------------- Appointment -----------------

export const getAllAppointmentAPI = () =>
  adminAPI("GET", `${BASEURL}/appointments`, "");

export const deleteAppointmentAPI = (id) =>
  adminAPI("DELETE", `${BASEURL}/appointments/${id}`, "");

export const updateAppointmentApi = (id, data) =>
  adminAPI("PUT", `${BASEURL}/appointments/${id}`, data);