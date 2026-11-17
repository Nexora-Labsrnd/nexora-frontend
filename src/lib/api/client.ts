// API Client helper for Nexora Frontend

// Empty by default: requests go to the same origin and Vite proxies /api to
// the FastAPI backend (see vite.config.ts). This is what makes the app work
// from another laptop or a public share link. On Vercel, VITE_API_URL points
// at the Render backend; it is baked into the build, so set it before deploy.
const API_BASE_URL: string = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export type UserRole = 'technician' | 'doctor' | 'lab_director' | 'admin';

export interface User {
  uid: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Detection {
  class_id: number;
  class_name: string;
  confidence: number;
  box: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface RawOutput {
  quality_check: string;
  quality: Record<string, unknown>;
  quality_penalty_scalar: number;
  model: {
    available: boolean;
    path: string;
    error: string | null;
  };
  detection_count: number;
  detections: Detection[];
  bounding_boxes: number[][];
  detected: string;
  confidence: number | null;
}

// Mirrors backend SpecimenRead (app/schemas/specimen.py). Fields absent from
// that response are intentionally not declared here.
export interface Specimen {
  uid: string;
  specimen_type: 'blood' | 'urine' | 'stool';
  image_path: string;
  prediction?: string | null;
  confidence?: number | null;
  raw_output?: string | null;
  user_feedback?: 'correct' | 'incorrect' | null;
  created_at: string;
}

export interface DashboardMetrics {
  total_uploads: number;
  active_users: number;
  uploads_by_type: { blood: number; urine: number; stool: number };
  avg_confidence: { blood: number | null; urine: number | null; stool: number | null };
  feedback_accuracy: { blood: number | null; urine: number | null; stool: number | null };
  diagnosis_ranking: Array<{ rank: number; count: number; name?: string | null }>;
}

export function parseRawOutput(raw: string | null | undefined): RawOutput | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RawOutput;
  } catch {
    return null;
  }
}

export function getDetectionsFromSpecimen(specimen: Specimen): Detection[] {
  return parseRawOutput(specimen.raw_output)?.detections ?? [];
}

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      'Cannot reach the Nexora API. If you are running locally, start it with start.bat; '
        + 'otherwise check that the deployed backend is awake and try again.'
    );
  }

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errData = await response.json();
      const detail = errData.detail ?? errData.message;
      if (Array.isArray(detail)) {
        // FastAPI validation errors: [{ loc, msg }, ...]
        errorMessage = detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join('. ') || errorMessage;
      } else if (typeof detail === 'string') {
        errorMessage = detail;
      }
    } catch {
      errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
