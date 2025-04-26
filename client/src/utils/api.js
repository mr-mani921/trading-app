import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

console.log(import.meta.env.VITE_API_URL);

// Helper to detect Safari browsers
const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.indexOf("safari") !== -1 &&
    ua.indexOf("chrome") === -1 &&
    ua.indexOf("android") === -1
  );
};

// Helper to detect iOS devices
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

// Add request interceptor for auth token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  // Always include token in Authorization header if it exists
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Special handling for Safari browsers
  if (isSafari() || isIOS()) {
    // Extended timeout for all requests in Safari
    config.timeout = 60000;

    // Set cache control headers to prevent caching issues in Safari
    config.headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
    config.headers["Pragma"] = "no-cache";
    config.headers["Expires"] = "0";

    // Add timestamp to prevent caching issues with Safari
    const separator = config.url.includes("?") ? "&" : "?";
    config.url = `${config.url}${separator}_ts=${new Date().getTime()}`;
  }

  return config;
});

// Add response interceptor to handle platform-specific issues
API.interceptors.response.use(
  (response) => {
    // If the response includes a token, store it
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response;
  },
  (error) => {
    // Specific handling for Safari/iOS connection issues
    if (
      (isSafari() || isIOS()) &&
      (error.message === "Network Error" ||
        error.message.includes("Failed to fetch") ||
        error.message.includes("access control checks") ||
        (error.response && error.response.status === 0))
    ) {
      console.error(
        "Safari connection error - attempting recovery",
        error.message
      );

      // Try to recover by retrying the request
      const originalRequest = error.config;
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        // Add a short delay before retrying to allow any locks to clear
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(API(originalRequest));
          }, 500);
        });
      }
    }

    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 503) {
      // Clear token if it's invalid
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

export default API;
