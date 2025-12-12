import axios from "axios";
import { getAccessToken } from "../helper/auth";

const axiosExternal = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
  withCredentials: true,
});

axiosExternal.interceptors.request.use(async(config) => {
  const token = getAccessToken()

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  return config;
});

export default axiosExternal;
