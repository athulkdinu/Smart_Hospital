import axios from "axios";

const commonAPI = async (method, url, data = {}) => {
  try {
    const response = await axios({ method, url, data });
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default commonAPI;


