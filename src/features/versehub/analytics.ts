"use client";

type VersehubEventName =
    | "versehub_mood_click"
    | "versehub_reflection_complete"
    | "versehub_audio_toggle";

type VersehubEventPayload = {
    persona?: string;
    variant?: string;
    meta?: Record<string, unknown>;
};

const SESSION_KEY = "tct:versehub:session-id";

function getVersehubSessionId(): string {
    if (typeof window === "undefined") {
        return "server";
    }

    const stored = window.localStorage.getItem(SESSION_KEY);
    if (stored) return stored;

    const nextId = `vh-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(SESSION_KEY, nextId);
    return nextId;
}

export async function trackVersehubEvent(
    lang: string,
    eventName: VersehubEventName,
    payload: VersehubEventPayload = {}
): Promise<void> {
    if (typeof window === "undefined") return;

    const body = {
        session_id: getVersehubSessionId(),
        persona: payload.persona ?? "reader",
        variant: payload.variant ?? "p5",
        event_name: eventName,
        meta: payload.meta ?? {},
    };

    window.dispatchEvent(new CustomEvent("tct:versehub:event", { detail: body }));

    try {
        await fetch(`/api/versehub/${lang}/events`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(body),
            keepalive: true,
        });
    } catch {
        // Telemetry should never block reading flow.
    }
}
