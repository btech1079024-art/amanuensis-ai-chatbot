const API_BASE = "http://localhost:8080";
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