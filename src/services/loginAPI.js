// src/services/loginAPI.js
import axios from "axios";
import BASEURL from "./serverURL";

// 🔐 Role-based login function
export const loginUser = async (loginId, password, role) => {
  try {
    let endpoint = "";

    if (role === "doctor") endpoint = "doctors";
    else if (role === "administrator") endpoint = "admins";
    else endpoint = "patients";

    const url = `${BASEURL}/${endpoint}?loginId=${loginId}&password=${password}`;
    
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    const data = response.data;

    if (data && Array.isArray(data) && data.length > 0) {
      return data[0]; // return the matched user object
    }

    return null;
  } catch (err) {
    console.error("Login API Error:", err);
    
    // Check if it's a network/CORS error
    if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED' || err.message?.includes('CORS')) {
      throw new Error("Unable to connect to backend server. Please check if the server is running.");
    }
    
    // Check if it's a timeout
    if (err.code === 'ECONNABORTED') {
      throw new Error("Request timeout. The server may be sleeping. Please try again.");
    }
    
    // Re-throw other errors
    throw err;
  }
};
