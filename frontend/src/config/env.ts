const rawBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_BASE_URL = rawBaseUrl ?? "http://localhost:5000/api";
