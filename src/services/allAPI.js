import commonAPI from "./commonAPI"
import BASEURL from "./serverURL"

// 1. Add Doctor
export const addDoctorAPI = async (data) => {
    return await commonAPI("POST", `${BASEURL}/doctors`, data)
}

//2. Get All Doctors
export const getAllDoctorAPI = async () => {
    return await commonAPI("GET", `${BASEURL}/doctors`, {})
}


//4. Delete Notes
export const deleteDoctorApi = async (id) => {
    return await commonAPI("DELETE", `${BASEURL}/doctors/${id}`)
}

//3. Update
export const updateDoctorApi = async (id, doc) => {
    return await commonAPI('PUT', `${BASEURL}/doctors/${id}`, doc)
}


//2. Get All Doctors
export const getAllPatientAPI = async () => {
    return await commonAPI("GET", `${BASEURL}/patients`, {})
}

//3. Update Patient
export const updatePatientApi = async (id, data) => {
    return await commonAPI('PUT', `${BASEURL}/patients/${id}`, data)
}

//4. Delete Notes
export const deletePatientAPI = async (id) => {
    return await commonAPI("DELETE", `${BASEURL}/doctors/${id}`)
}

