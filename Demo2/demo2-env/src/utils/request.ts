import axios from 'axios';

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// 响应拦截器：直接返回 data
request.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);

export default request;
