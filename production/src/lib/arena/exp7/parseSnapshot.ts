import type { Exp7SessionSnapshot } from "@/lib/arena/exp7/sessionStore";

export function parseExp7SessionSnapshot(body: unknown): Exp7SessionSnapshot | undefined {
  if (!body || typeof body !== "object") return undefined;
  const snapshot = (body as { snapshot?: unknown }).snapshot;
  if (!snapshot || typeof snapshot !== "object") return undefined;

  const raw = snapshot as Exp7SessionSnapshot;
  if (!Array.isArray(raw.transcript) && !Array.isArray(raw.movesLedger)) {
    return undefined;
  }

  const sceneId =
    typeof raw.sceneId === "string"
      ? raw.sceneId
      : raw.sceneId != null
        ? String(raw.sceneId)
        : undefined;

  return {
    transcript: Array.isArray(raw.transcript) ? raw.transcript : [],
    movesLedger: Array.isArray(raw.movesLedger) ? raw.movesLedger : [],
    exp7Arc: raw.exp7Arc,
    sceneId,
    createdAt: raw.createdAt,
  };
}

export function parseRequestSnapshot(request: Request): Promise<Exp7SessionSnapshot | undefined> {
  return request
    .json()
    .then((body) => parseExp7SessionSnapshot(body))
    .catch(() => undefined);
}
