// src/services/loginAPI.js
import commonAPI from "./commonAPI";
import BASEURL from "./serverURL";

// 🔐 Role-based login function
export const loginUser = async (loginId, password, role) => {
  try {
    let endpoint = "";

    if (role === "doctor") endpoint = "doctors";
    else if (role === "administrator") endpoint = "admins";
    else endpoint = "patients";

    const url = `${BASEURL}/${endpoint}?loginId=${loginId}&password=${password}`;
    const data = await commonAPI("GET", url);

    if (data && data.length > 0) {
      return data[0]; // return the matched user object
    }

    return null;
  } catch (err) {
    console.error("Login API Error:", err);
    throw err;
  }
};
