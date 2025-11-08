import axios from "axios";

const commonAPI = async (method, url, data = {}) => {
  try {
    console.log(`API Call: ${method} ${url}`);
    
    const response = await axios({ 
      method, 
      url, 
      data,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 15000, // 15 second timeout for Render (which can be slow on free tier)
      withCredentials: false // Don't send credentials for CORS
    });
    
    console.log(`API Success: ${method} ${url}`, response.status);
    return response.data;
  } catch (error) {
    // Detailed error logging
    const errorDetails = {
      url,
      method,
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    };
    
    console.error('API Error Details:', errorDetails);
    
    // Check if it's a network/CORS error
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || !error.response) {
      // Check for CORS specific errors
      if (error.message && error.message.includes('CORS')) {
        throw new Error('CORS Error: Backend server needs to allow requests from your frontend domain. Please check CORS configuration on the backend.');
      }
      
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout: The server took too long to respond. This might happen if the backend is sleeping (Render free tier). Please try again.');
      }
      
      // Generic network error
      throw new Error(`Network error: Unable to connect to server at ${url}. Please check: 1) Backend is running, 2) CORS is configured, 3) URL is correct.`);
    }
    
    // Handle HTTP errors
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        throw new Error(`Endpoint not found: ${url}. Please check the backend URL.`);
      } else if (status === 500) {
        throw new Error('Server error: The backend encountered an error. Please try again later.');
      } else if (status >= 400 && status < 500) {
        // Return empty array for GET requests on client errors (like 404, 401, etc.)
        if (method === 'GET') {
          return [];
        }
        return null;
      }
    }
    
    // Return empty array for GET requests on error, null for others
    if (method === 'GET') {
      return [];
    }
    return null;
  }
};

export default commonAPI;


