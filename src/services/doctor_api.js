import commonAPI from './commonAPI'
import BASEURL from './serverURL'

export const getAllTockens = async () => await commonAPI('GET', `${BASEURL}/tocken`, {})
export const getAllAppoinments = async () => await commonAPI('GET', `${BASEURL}/appointments`, {})