import commonAPI from "./commonAPI"
import BASEURL from "./serverURL"

// ----------------- Doctor -----------------
export const addDoctorApi = async (data) => {
    return await commonAPI("POST", `${BASEURL}/doctors`, data)
}

export const getAllDoctorAPI = async () => {
    return await commonAPI("GET", `${BASEURL}/doctors`, {})
}

export const deleteDoctorApi = async (id) => {
    return await commonAPI("DELETE", `${BASEURL}/doctors/${id}`)
}

export const updateDoctorApi = async (id, doc) => {
    return await commonAPI('PUT', `${BASEURL}/doctors/${id}`, doc)
}


// ----------------- Patient -----------------

export const getAllPatientAPI = async () => {
    return await commonAPI("GET", `${BASEURL}/patients`, {})
}

export const updatePatientApi = async (id, data) => {
    return await commonAPI('PUT', `${BASEURL}/patients/${id}`, data)
}

export const deletePatientAPI = async (id) => {
    return await commonAPI("DELETE", `${BASEURL}/doctors/${id}`)
}


// ----------------- Appointment -----------------

export const getAllAppointmentAPI = () =>
  commonAPI("GET", `${BASEURL}/appointments`, "");

export const deleteAppointmentAPI = (id) =>
  commonAPI("DELETE", `${BASEURL}/appointments/${id}`, "");

export const updateAppointmentApi = (id, data) =>
  commonAPI("PUT", `${BASEURL}/appointments/${id}`, data);