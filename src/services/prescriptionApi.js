import commonAPI from './commonAPI'
import BASEURL from './serverURL'

export const getAllPrescriptions = async () => await commonAPI('GET', `${BASEURL}/prescriptions`, {})

export const getPrescriptionsByPatientId = async (patientId) => {
  const allPrescriptions = await getAllPrescriptions()
  if (Array.isArray(allPrescriptions)) {
    return allPrescriptions.filter(px => String(px.patientId) === String(patientId))
  }
  return []
}

