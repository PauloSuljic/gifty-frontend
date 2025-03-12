import { apiClient, createAuthenticatedApiClient } from "./apiClient";

// Login function
export const loginUser = async (email: string, password: string) => {
  try 
  {
    const response = await apiClient.post("/auth/login", { email, password });
    const token = response.data.token;

    if (token) {
      localStorage.setItem("jwtToken", token); // Store token in localStorage
      return await fetchUserDataWithToken(); // Fetch user data after login
    }
    return null;
   } catch (error:any) {
        console.error("Login failed:", error.response ? error.response.data : error);
        throw error;
    }
};

// Register function
export const registerUser = async (username: string, email: string, password: string) => {
  try {
    const response = await apiClient.post("/auth/register", { username, email, password });
    return response.data;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
};

// Logout function
export const logoutUser = async () => {
  try {
    await apiClient.post("/auth/logout");
    localStorage.removeItem("jwtToken"); // Remove token on logout
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};

// Get the JWT token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem("jwtToken");
};

// Example usage within a function that needs to send an authorized request:
export const fetchUserDataWithToken = async () => {
    const token = getAuthToken();
    if (token) {
      const api = createAuthenticatedApiClient(token);
      try {
        const response = await api.get("/userprofile");
        return response.data;  // Only return the user data, not the entire Axios response
      } catch (error) {
        console.error("Failed to fetch user data", error);
        throw error;
      }
    }
    throw new Error("No token found!");
};
