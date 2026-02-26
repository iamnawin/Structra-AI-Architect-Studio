export type Project = {
  id: number;
  title: string;
  location: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type Requirements = {
  id: number;
  projectId: number;
  plotSize: string | null;
  roomsJson: string | null;
  style: string | null;
  budgetRange: string | null;
  constraintsJson: string | null;
  vastu: number;
  createdAt: string;
};

export type DesignSummary = {
  summary: string;
  floorPlan: { rooms: Array<{ name: string; area: string }>; totalArea: number };
  style: string;
  estimatedCost: string;
  renderPrompt: string;
  boqItems: Array<{ item: string; qty: number; unit: string; estimatedCost: string }>;
  error?: string;
};

export type Version = {
  id: number;
  projectId: number;
  versionNo: number;
  status: 'queued' | 'running' | 'completed' | 'failed';
  prompt: string | null;
  summaryJson: string | null;
  summary?: DesignSummary | null;
  provider: string;
  costEstimate: number | null;
  createdAt: string;
};

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api/v1${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  const data = await res.json();
  if (!res.ok) throw new ApiError(res.status, data.code ?? 'api_error', data.message ?? 'Request failed');
  return data as T;
}

export const api = {
  projects: {
    list: () => request<{ projects: Project[] }>('/projects'),
    get: (id: number) => request<{ project: Project }>(`/projects/${id}`),
    create: (body: { title: string; location: string }) =>
      request<{ project: Project }>('/projects', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: number, body: Partial<Pick<Project, 'title' | 'location' | 'status'>>) =>
      request<{ project: Project }>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  },
  requirements: {
    get: (projectId: number) => request<{ requirements: Requirements | null }>(`/projects/${projectId}/requirements`),
    create: (projectId: number, body: {
      plotSize?: string; rooms?: string[]; style?: string;
      budgetRange?: string; constraints?: string; vastu?: boolean;
    }) =>
      request<{ requirements: Requirements }>(`/projects/${projectId}/requirements`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },
  versions: {
    list: (projectId: number) => request<{ versions: Version[] }>(`/projects/${projectId}/versions`),
    get: (projectId: number, versionId: number) =>
      request<{ version: Version }>(`/projects/${projectId}/versions/${versionId}`),
    create: (projectId: number, body: { prompt?: string }) =>
      request<{ version: Version; estimatedTime: string; message: string }>(
        `/projects/${projectId}/versions`,
        { method: 'POST', body: JSON.stringify(body) },
      ),
  },
};
