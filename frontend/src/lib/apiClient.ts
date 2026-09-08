import { supabase } from './supabaseClient'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  status: number
  detail?: string

  constructor(status: number, message: string, detail?: string) {
    super(message)
    this.status = status
    this.detail = detail
  }
}

async function detailFrom(res: Response): Promise<string | undefined> {
  try {
    const body = (await res.json()) as { detail?: unknown }
    return typeof body?.detail === 'string' ? body.detail : undefined
  } catch {
    return undefined
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Every request the frontend makes to the API funnels through here — the
 * only difference between the exported helpers below is the HTTP method,
 * whether a body is sent, and whether the current session's token (if any)
 * is attached. `authed: true` doesn't require a session to exist — it just
 * attaches one when it does, so it's safe to use on endpoints that serve
 * both guests and signed-in users (see scanApi.ts). */
async function request(
  path: string,
  { method = 'GET', body, authed = false }: { method?: string; body?: unknown; authed?: boolean } = {},
): Promise<Response> {
  const headers: Record<string, string> = body !== undefined ? { 'Content-Type': 'application/json' } : {}
  if (authed) Object.assign(headers, await authHeader())

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new ApiError(res.status, (await detailFrom(res)) ?? `API error ${res.status}: ${path}`)
  return res
}

export async function apiGet<T>(path: string): Promise<T> {
  return (await request(path)).json() as Promise<T>
}

/** Fire-and-forget ping at /health, called once on app load (see App.tsx).
 * Render's free tier spins the backend down after ~15 minutes idle and
 * takes 30-50s to wake it back up on the next real request — that request
 * used to always be the scan itself. Pinging the moment someone lands on
 * the site instead means the wake-up happens in parallel with them reading
 * the page and typing their email, so by the time they actually submit a
 * scan the backend is far more likely to already be warm. Errors here are
 * expected and irrelevant (a cold instance can itself time out this exact
 * ping) — this is purely a best-effort head start, never something a
 * caller waits on or reacts to. */
export function warmBackend(): void {
  fetch(`${API_BASE_URL}/health`).catch(() => {})
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return (await request(path, { method: 'POST', body })).json() as Promise<T>
}

export async function apiPostForBlob(path: string, body: unknown): Promise<Blob> {
  return (await request(path, { method: 'POST', body })).blob()
}

/** Authenticated variants — attach the current Supabase session's access
 * token when one exists. Every protected dashboard endpoint (GET
 * /api/scans/me and beyond) needs these; some public endpoints (POST
 * /api/scans, POST /api/reports/pdf) also use them so a signed-in caller's
 * request gets linked to their account instead of creating an orphaned
 * guest row. */

export async function apiGetAuthed<T>(path: string): Promise<T> {
  return (await request(path, { authed: true })).json() as Promise<T>
}

export async function apiPostAuthed<T>(path: string, body: unknown): Promise<T> {
  return (await request(path, { method: 'POST', body, authed: true })).json() as Promise<T>
}

export async function apiPostForBlobAuthed(path: string, body: unknown): Promise<Blob> {
  return (await request(path, { method: 'POST', body, authed: true })).blob()
}

export async function apiDeleteAuthed<T>(path: string): Promise<T> {
  return (await request(path, { method: 'DELETE', authed: true })).json() as Promise<T>
}
