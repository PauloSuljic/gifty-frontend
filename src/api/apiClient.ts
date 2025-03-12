import axios from "axios";

// Create the base API client without authorization
export const apiClient = axios.create({
  baseURL: "http://localhost:7066/api", // Backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to create an authenticated client with JWT token
export const createAuthenticatedApiClient = (token: string) => {
  return axios.create({
    baseURL: "http://localhost:7066/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Attach JWT token
    },
  });
};
