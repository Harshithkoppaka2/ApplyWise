import type { Application, ApplicationInput, Summary, Breakdown, Answer } from './types';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options?.headers } });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { const body = await response.json(); message = body.message ?? message; } catch { /* Unexpected response body */ }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  applications: () => request<Application[]>('/applications'),
  create: (input: ApplicationInput) => request<Application>('/applications', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: number, input: ApplicationInput) => request<Application>(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  remove: (id: number) => request<void>(`/applications/${id}`, { method: 'DELETE' }),
  summary: () => request<Summary>('/analytics/summary'),
  roles: () => request<Breakdown[]>('/analytics/roles'),
  resumes: () => request<Breakdown[]>('/analytics/resumes'),
  followUps: () => request<Application[]>('/analytics/follow-ups'),
  ask: (question: string) => request<Answer>('/assistant', { method: 'POST', body: JSON.stringify({ question }) }),
  loadDemo: () => request<{ added: number; message?: string }>('/demo/load', { method: 'POST' })
};
