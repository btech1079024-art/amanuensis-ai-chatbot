// Falls back to the live Vercel backend if VITE_API_BASE_URL isn't set —
// so unset it locally (or point it at http://localhost:8080 in a .env) if
// you want local frontend dev to hit your local backend instead of prod.
const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://amanuensis-ai-chatbot-86xc.vercel.app";
const TOKEN_KEY = "amanuensis-token";

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (response.status === 401) {
        // The token is missing/expired/invalid — clear it and let the app
        // know so it can fall back to the login screen instead of failing
        // silently on every subsequent request.
        setToken(null);
        window.dispatchEvent(new Event("amanuensis-unauthorized"));
    }

    return response;
}

export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
    del: (path) => request(path, { method: "DELETE" }),
};

// Reads a fetch Response whose body is a stream of
// `data: {"chunk":"..."}` / `data: {"done":true}` / `data: {"error":"..."}`
// lines (as sent by POST /api/chat), calling onProgress with the text
// assembled so far after every chunk. Resolves with the full final text.
// Throws if the stream reports an error.
export async function readSSEStream(response, onProgress) {
    if (!response.body) return "";

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assembled = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep the last, possibly-incomplete line for next read

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;

            const payload = trimmed.slice(5).trim();
            if (!payload) continue;

            let parsed;
            try {
                parsed = JSON.parse(payload);
            } catch {
                continue;
            }

            if (parsed.error) throw new Error(parsed.error);
            if (parsed.chunk) {
                assembled += parsed.chunk;
                onProgress?.(assembled);
            }
        }
    }

    return assembled;
}