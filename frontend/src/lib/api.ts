import axios from "axios";
import { API_BASE } from "./config";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000
});

// attach x-user-id (selected role identity)
export function setIdentity(id: string) {
  api.defaults.headers.common["x-user-id"] = id;
}
