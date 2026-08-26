/**
 * OpenAI Realtime API browser client (WebRTC) — adapted from arena/roleplay/packages/web.
 */

import { EXP7_COVERAGE_TOPIC } from "@/lib/arena/exp7/coverageJudge";

export type RealtimeEvent = {
  type: string;
  [key: string]: unknown;
};

export interface RealtimeHandlers {
  onUserSpeechStart?: () => void;
  onUserSpeechStop?: () => void;
  onUserTranscriptDelta?: (text: string) => void;
  onUserTranscriptDone?: (text: string) => void;
  onCharacterTranscriptDelta?: (delta: string) => void;
  onCharacterTranscriptDone?: (full: string) => void;
  /** Full `response.done` event — use extractCharacterTranscriptFromEvent for GA payloads. */
  onResponseDone?: (event: RealtimeEvent) => void;
  /** Text output of a completed out-of-band judge response (metadata topic match). */
  onJudgeResponseDone?: (text: string) => void;
  onError?: (err: { code?: string; message: string }) => void;
  onOpen?: () => void;
  onClose?: () => void;
  /** Fired when the remote WebRTC audio track is attached to the <audio> element. */
  onRemoteTrack?: () => void;
}

/** Metadata topic marking hidden out-of-band judge responses. */
const REALTIME_JUDGE_TOPIC = EXP7_COVERAGE_TOPIC;

type RealtimeContentPart = {
  type?: string;
  transcript?: string;
  text?: string;
};

type RealtimeOutputItem = {
  type?: string;
  transcript?: string;
  content?: RealtimeContentPart[];
};

/** Pull Alex transcript from GA `response.done` / output-item payloads when stream `.done` events are missing. */
export function extractCharacterTranscriptFromEvent(event: RealtimeEvent): string {
  const chunks: string[] = [];

  const push = (value: unknown) => {
    if (typeof value === "string" && value.trim()) chunks.push(value.trim());
  };

  push(event.transcript);

  const part = event.part as RealtimeContentPart | undefined;
  if (part?.type === "output_audio" || part?.type === "audio") {
    push(part.transcript);
  }
  push(part?.text);

  const item = event.item as RealtimeOutputItem | undefined;
  if (item?.type === "message" || item?.type === "output_audio") {
    push(item.transcript);
    for (const content of item.content ?? []) {
      if (content.type === "output_audio" || content.type === "audio") push(content.transcript);
      if (content.type === "output_text" || content.type === "text") push(content.text);
    }
  }

  const response = event.response as { output?: RealtimeOutputItem[] } | undefined;
  for (const output of response?.output ?? []) {
    push(output.transcript);
    for (const content of output.content ?? []) {
      if (content.type === "output_audio" || content.type === "audio") push(content.transcript);
      if (content.type === "output_text" || content.type === "text") push(content.text);
    }
  }

  return chunks.join(" ").trim();
}

export interface RealtimeSessionOptions {
  clientSecret: string;
  model: string;
  audioElement: HTMLAudioElement;
  micStream: MediaStream;
  handlers: RealtimeHandlers;
}

export interface ActiveRealtimeSession {
  pc: RTCPeerConnection;
  dc: RTCDataChannel;
  send: (event: object) => void;
  cancelResponse: () => void;
  triggerResponse: (instructions?: string) => void;
  updateInstructions: (instructions: string) => void;
  /** Hidden out-of-band response: judge the conversation, never spoken/stored. */
  requestJudgeResponse: (instructions: string) => void;
  close: () => void;
}

const REALTIME_SDP_URL = "https://api.openai.com/v1/realtime/calls";

/** OpenAI emits these when barge-in cancels an already-finished response — safe to ignore. */
export function isBenignRealtimeError(message: string): boolean {
  const m = String(message ?? "").toLowerCase();
  return (
    m.includes("no active response") ||
    m.includes("cancellation failed") ||
    m.includes("response_cancel_not_active")
  );
}

/** Call synchronously inside a click handler so later WebRTC audio can play. */
export function unlockBrowserAudio(): void {
  if (typeof window === "undefined") return;
  try {
    const ctx = new AudioContext();
    void ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Best-effort unlock only.
  }
}

export async function ensureAudioPlaying(audio: HTMLAudioElement): Promise<boolean> {
  audio.muted = false;
  audio.volume = 1;
  audio.setAttribute("playsinline", "true");
  try {
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

function attachRemoteTrack(
  audioElement: HTMLAudioElement,
  event: RTCTrackEvent,
  handlers?: RealtimeHandlers,
) {
  const stream =
    event.streams[0] ?? (event.track ? new MediaStream([event.track]) : null);
  if (!stream) return;
  audioElement.srcObject = stream;
  void ensureAudioPlaying(audioElement);
  handlers?.onRemoteTrack?.();
}

export async function openRealtimeSession(
  opts: RealtimeSessionOptions,
): Promise<ActiveRealtimeSession> {
  const { clientSecret, model, audioElement, micStream, handlers } = opts;

  const pc = new RTCPeerConnection();

  pc.ontrack = (event) => {
    attachRemoteTrack(audioElement, event, handlers);
  };

  for (const track of micStream.getAudioTracks()) {
    pc.addTrack(track, micStream);
  }

  const dc = pc.createDataChannel("oai-events");

  const send = (event: object) => {
    if (dc.readyState === "open") {
      dc.send(JSON.stringify(event));
    }
  };

  const cancelResponse = () => send({ type: "response.cancel" });
  const triggerResponse = (instructions?: string) =>
    send({
      type: "response.create",
      response: instructions ? { instructions } : {},
    });
  const updateInstructions = (instructions: string) =>
    send({
      type: "session.update",
      session: { instructions },
    });
  const requestJudgeResponse = (instructions: string) =>
    send({
      type: "response.create",
      response: {
        conversation: "none",
        metadata: { topic: REALTIME_JUDGE_TOPIC },
        output_modalities: ["text"],
        instructions,
      },
    });

  /** Response ids of hidden judge generations — their events bypass the character path. */
  const judgeResponseIds = new Set<string>();

  dc.onopen = () => handlers.onOpen?.();
  dc.onclose = () => handlers.onClose?.();
  dc.onmessage = (msg) => {
    let event: RealtimeEvent;
    try {
      event = JSON.parse(msg.data);
    } catch {
      return;
    }
    if (interceptJudgeEvent(event, judgeResponseIds, handlers)) return;
    routeEvent(event, handlers);
  };

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  const sdpRes = await fetch(`${REALTIME_SDP_URL}?model=${encodeURIComponent(model)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${clientSecret}`,
      "Content-Type": "application/sdp",
    },
    body: offer.sdp,
  });
  if (!sdpRes.ok) {
    pc.close();
    throw new Error(`Realtime SDP exchange failed: ${sdpRes.status} ${await sdpRes.text()}`);
  }
  const answerSdp = await sdpRes.text();
  await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

  return {
    pc,
    dc,
    send,
    cancelResponse,
    triggerResponse,
    updateInstructions,
    requestJudgeResponse,
    close: () => {
      try {
        dc.close();
      } catch {
        /* ignore */
      }
      try {
        pc.getSenders().forEach((s) => s.track?.stop());
      } catch {
        /* ignore */
      }
      try {
        pc.close();
      } catch {
        /* ignore */
      }
    },
  };
}

type RealtimeResponseRef = {
  id?: string;
  metadata?: { topic?: string };
};

/**
 * Swallow all events belonging to hidden judge responses so they never touch
 * the character speech/turn lifecycle. Returns true when the event was consumed.
 */
function interceptJudgeEvent(
  event: RealtimeEvent,
  judgeIds: Set<string>,
  h: RealtimeHandlers,
): boolean {
  const response = event.response as RealtimeResponseRef | undefined;
  const isJudgeByMetadata = response?.metadata?.topic === REALTIME_JUDGE_TOPIC;

  if (event.type === "response.created" && isJudgeByMetadata) {
    if (response?.id) judgeIds.add(response.id);
    return true;
  }

  const responseId =
    (typeof event.response_id === "string" ? event.response_id : undefined) ??
    response?.id;
  const isJudge = isJudgeByMetadata || (responseId ? judgeIds.has(responseId) : false);
  if (!isJudge) return false;

  if (event.type === "response.done") {
    if (responseId) judgeIds.delete(responseId);
    const text = extractCharacterTranscriptFromEvent(event);
    if (text) h.onJudgeResponseDone?.(text);
  }
  // All other judge events (text deltas, output items) are dropped silently.
  return true;
}

function routeEvent(event: RealtimeEvent, h: RealtimeHandlers) {
  switch (event.type) {
    case "input_audio_buffer.speech_started":
      h.onUserSpeechStart?.();
      return;
    case "input_audio_buffer.speech_stopped":
      h.onUserSpeechStop?.();
      return;
    case "conversation.item.input_audio_transcription.delta": {
      const delta = String(event.delta ?? "");
      if (delta) h.onUserTranscriptDelta?.(delta);
      return;
    }
    case "conversation.item.input_audio_transcription.completed": {
      const transcript = String(event.transcript ?? "");
      h.onUserTranscriptDone?.(transcript);
      return;
    }
    case "response.audio_transcript.delta":
    case "response.output_audio_transcript.delta": {
      const delta = String(event.delta ?? "");
      if (delta) h.onCharacterTranscriptDelta?.(delta);
      return;
    }
    case "response.audio_transcript.done":
    case "response.output_audio_transcript.done": {
      const full = String(event.transcript ?? extractCharacterTranscriptFromEvent(event));
      h.onCharacterTranscriptDone?.(full);
      return;
    }
    case "response.content_part.done":
    case "response.output_item.done": {
      const full = extractCharacterTranscriptFromEvent(event);
      if (full) h.onCharacterTranscriptDone?.(full);
      return;
    }
    case "response.done":
      h.onResponseDone?.(event);
      return;
    case "error": {
      const err = (event.error || event) as { code?: string; message?: unknown };
      const message = String(err.message ?? "Realtime error");
      if (isBenignRealtimeError(message)) return;
      h.onError?.({ code: err.code, message });
      return;
    }
    default:
      return;
  }
}

export async function getMicrophoneStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: false,
  });
}
