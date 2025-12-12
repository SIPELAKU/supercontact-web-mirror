"use client";

import axios from "axios";

const axiosInternal = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export default axiosInternal;
