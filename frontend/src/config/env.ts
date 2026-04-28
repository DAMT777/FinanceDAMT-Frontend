const rawBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

// Local fallback works for Android emulator; override with EXPO_PUBLIC_API_BASE_URL when needed.
export const API_BASE_URL = rawBaseUrl ?? "http://localhost:5000/api";
