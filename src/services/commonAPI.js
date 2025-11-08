import axios from "axios";

const commonAPI = async (method, url, data = {}) => {
  try {
    const response = await axios({ 
      method, 
      url, 
      data,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });
    return response.data;
  } catch (error) {
    // Check if it's a network/CORS error
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || !error.response) {
      console.error('Network/CORS Error:', {
        url,
        method,
        message: error.message,
        code: error.code
      });
      // Throw network errors so they can be handled properly
      throw new Error('Network error: Unable to connect to server. Please check your connection and try again.');
    }
    
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


