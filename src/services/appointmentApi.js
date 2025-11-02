import commonAPI from './commonAPI'
import BASEURL from './serverURL'

export const getAllAppointments = async () => await commonAPI('GET', `${BASEURL}/appointments`, {})
export const getAppointmentById = async (id) => await commonAPI('GET', `${BASEURL}/appointments/${id}`, {})

// Get appointments by patient ID
export const getAppointmentsByPatientId = async (patientId) => {
  const allAppointments = await getAllAppointments()
  if (Array.isArray(allAppointments)) {
    return allAppointments.filter(apt => String(apt.patientId) === String(patientId))
  }
  return []
}

// Get appointments by patient email
export const getAppointmentsByPatientEmail = async (email) => {
  const allAppointments = await getAllAppointments()
  if (Array.isArray(allAppointments)) {
    return allAppointments.filter(apt => String(apt.patientEmail) === String(email))
  }
  return []
}

// Create a new appointment
export const createAppointment = async (appointmentData) => {
  return await commonAPI('POST', `${BASEURL}/appointments`, appointmentData)
}

