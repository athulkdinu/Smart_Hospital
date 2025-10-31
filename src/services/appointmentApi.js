import commonAPI from './commonAPI'
import BASEURL from './serverURL'

export const getAllAppointments = async () => await commonAPI('GET', `${BASEURL}/appointments`, {})
export const getAppointmentById = async (id) => await commonAPI('GET', `${BASEURL}/appointments/${id}`, {})


