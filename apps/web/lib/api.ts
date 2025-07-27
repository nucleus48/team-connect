import "server-only";

import axios from "axios";
import { getAccessToken } from "./tokens";

export const BASE_API_URL = "http://localhost:3030";

export const publicApi = axios.create({
  baseURL: BASE_API_URL,
});

export const api = axios.create({
  baseURL: BASE_API_URL,
});

api.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken();
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});
