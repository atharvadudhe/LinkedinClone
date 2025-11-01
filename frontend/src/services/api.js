import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_FRONTEND_URL,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  console.log('Token from localStorage:', token);
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
    console.log('Request headers:', req.headers);
  }
  return req;
});

export const signup = (data) => API.post("/auth/signup", data, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const login = (data) => API.post("/auth/login", data);

export const getAllPosts = () => API.get("/posts/all");
export const createPost = (data) => API.post("/posts/create", data, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const deletePost = (id) => API.delete(`/posts/${id}/delete`);
export const editPost = (id, data) => API.put(`/posts/${id}/edit`, data);

export const getUserProfile = () => API.get("/auth/profile");
export const updateProfile = (data) => API.put("/auth/profile", data);
export const getUserPosts = () => API.get("/posts/profile");
export const likePost = (id) => API.put(`/posts/${id}/like`);

export default API;