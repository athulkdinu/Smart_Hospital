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

//3. Get All Notes

export const updateNoteApi = async (id, note) => {
    return await commonAPI('PUT', `${BASEURL}/notes/${id}`, note)
}

//4. Delete Notes
export const deleteNoteApi = async (id) => {
    return await commonAPI("DELETE", `${BASEURL}/notes/${id}`)
}