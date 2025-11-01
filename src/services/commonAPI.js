import axios from "axios";

const commonAPI = async (method, url, data = {}) => {
  try {
    const response = await axios({ 
      method, 
      url, 
      data,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', {
      url,
      method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data
    });
    // Return empty array for GET requests on error, null for others
    if (method === 'GET') {
      return [];
    }
    return null;
  }
};

export default commonAPI;


