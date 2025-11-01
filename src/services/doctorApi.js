import commonAPI from './commonAPI'
import BASEURL from './serverURL'

export const getAllDoctors = async () => await commonAPI('GET', `${BASEURL}/doctors`, {})
export const getDoctorById = async (id) => await commonAPI('GET', `${BASEURL}/doctors/${id}`, {})


