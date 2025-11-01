import axios from "axios";

const BASE_URL = "http://localhost:5000"; // Backend JSON Server URL

// Role-based login
export const loginUser = async (loginId, password, role) => {
  try {
    let endpoint = "";

    if (role === "doctor") endpoint = "doctors";
    else if (role === "administrator") endpoint = "admins";
    else endpoint = "patients";

    const response = await axios.get(
      `${BASE_URL}/${endpoint}?loginId=${loginId}&password=${password}`
    );

    if (response.data.length > 0) {
      return response.data[0]; // return user object
    }

    return null;
  } catch (err) {
    console.error("Login API error:", err);
    throw err;
  }
};
