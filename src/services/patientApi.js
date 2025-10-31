import commonAPI from './commonAPI'
import BASEURL from './serverURL'

export const getAllPatients = async () => await commonAPI('GET', `${BASEURL}/patients`, {})
export const getPatientById = async (id) => await commonAPI('GET', `${BASEURL}/patients/${id}`, {})


