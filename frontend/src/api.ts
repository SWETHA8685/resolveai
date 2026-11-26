import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  headers: { "Content-Type": "application/json" },
});

export type Incident = {
  id: number;
  title: string;
  service: string;
  error_log: string;
  severity: string | null;
  category: string | null;
  root_cause: string | null;
  recommendations: string | null;
  status: string;
  created_at: string | null;
};

export type IncidentCreate = {
  title: string;
  service: string;
  error_log: string;
};

export async function getIncidents() {
  const response = await api.get<Incident[]>("/api/incidents/");
  return response.data;
}

export async function analyzeIncident(payload: IncidentCreate) {
  const response = await api.post<Incident>("/api/incidents/analyze", payload);
  return response.data;
}

export async function updateIncidentStatus(id: number, status: string) {
  const response = await api.patch(`/api/incidents/${id}/status`, { status });
  return response.data;
}

export async function deleteIncident(id: number) {
  const response = await api.delete(`/api/incidents/${id}`);
  return response.data;
}