import { apiRequest } from "./queryClient";

export async function generateActivity(formData: FormData) {
  const response = await apiRequest("POST", "/api/generate-activity", formData);
  return response.json();
}

export async function validateApiKey() {
  const response = await apiRequest("POST", "/api/validate-key", {});
  return response.json();
}

export async function getActivity(id: string) {
  const response = await apiRequest("GET", `/api/activities/${id}`, undefined);
  return response.json();
}
