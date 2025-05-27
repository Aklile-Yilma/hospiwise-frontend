

import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const BASE_URL = "https://hospiwise-backend.onrender.com/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Below is api setup to use across the app
export const api = {
  authPost: async <T>(
    url: string,
    data?: any,
    token?: string,
    signal: any = null, 
    timeoutMs = 100000,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await axiosInstance.post<T>(url, data, {
      ...config,
      headers: {
        ...config?.headers,
        Authorization: `Bearer ${token}`,
      },
      signal: signal,
      timeout: timeoutMs
    });
    return response.data;
  },
  authGet: async <T>(
    url: string,
    token?: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await axiosInstance.get<T>(url, {
      ...(config || {}),
      headers: {
        ...(config?.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  authGetBlob: async (
    url: string,
    token?: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ArrayBuffer>> => {
    const response = await axiosInstance.get<ArrayBuffer>(url, {
      ...config,
      headers: {
        ...config?.headers,
        Authorization: `Bearer ${token}`,
      },
      responseType: "arraybuffer",
    });
    return response;
  },
  authPut: async <T>(
    url: string,
    data?: any,
    token?: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await axiosInstance.put<T>(url, data, {
      ...config,
      headers: {
        ...config?.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  authDelete: async <T>(
    url: string,
    token?: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await axiosInstance.delete<T>(url, {
      ...config,
      headers: {
        ...config?.headers,
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  authPostFormData: async <T>(
    url: string,
    formData: FormData,
    token?: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await axiosInstance.post<T>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token || ""}`,
      },
    });
    return response.data;
  },
  // no auth token needed
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.get<T>(url, config);
    return response.data;
  },

  post: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  },
  put: async <T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  },
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  },
};

export default axiosInstance;