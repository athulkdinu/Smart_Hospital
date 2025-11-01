import commonAPI from './commonAPI'
import BASEURL from './serverURL'

// Get all tokens for a specific patient
export const getTokensByPatientId = async (patientId) => {
  const allTokens = await commonAPI('GET', `${BASEURL}/tokens`, {})
  if (Array.isArray(allTokens)) {
    return allTokens.filter(token => String(token.patientId) === String(patientId))
  }
  return []
}

// Get all tokens for a specific doctor
export const getTokensByDoctorId = async (doctorId) => {
  const allTokens = await commonAPI('GET', `${BASEURL}/tokens`, {})
  if (Array.isArray(allTokens)) {
    return allTokens.filter(token => String(token.doctorId) === String(doctorId))
  }
  return []
}

// Get all tokens
export const getAllTokens = async () => await commonAPI('GET', `${BASEURL}/tokens`, {})

// Check if doctor has reached daily token limit (50 tokens per day)
export const checkDailyTokenLimit = async (doctorId, date) => {
  const tokens = await getTokensByDoctorId(doctorId)
  const dateStr = date.split('T')[0] // Get YYYY-MM-DD format
  const tokensForDate = tokens.filter(token => {
    const tokenDate = token.date ? token.date.split('T')[0] : null
    return tokenDate === dateStr
  })
  return tokensForDate.length >= 50
}

// Create a new token
export const createToken = async (tokenData) => {
  // Check daily limit before creating
  const today = new Date().toISOString().split('T')[0]
  const isLimitReached = await checkDailyTokenLimit(tokenData.doctorId, today)
  
  if (isLimitReached) {
    throw new Error('No more tokens available for today. Maximum 50 tokens per doctor per day.')
  }
  
  // Get next token number for this doctor on this date
  const existingTokens = await getTokensByDoctorId(tokenData.doctorId)
  const dateStr = today
  const tokensForDate = existingTokens.filter(token => {
    const tokenDate = token.date ? token.date.split('T')[0] : null
    return tokenDate === dateStr
  })
  const tokenNumber = tokensForDate.length + 1
  
  const newToken = {
    ...tokenData,
    date: today,
    tokenNumber,
    createdAt: new Date().toISOString()
  }
  
  return await commonAPI('POST', `${BASEURL}/tokens`, newToken)
}

