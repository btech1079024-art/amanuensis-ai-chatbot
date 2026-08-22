// Thin wrappers around the browser's built-in speech APIs.
// Voice input: SpeechRecognition (Chrome/Edge only as of now — Safari/Firefox
// support is inconsistent, so callers should feature-detect first).
// Voice output: SpeechSynthesis (broad support, including Firefox/Safari).

export function getSpeechRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    return SR || null;
}

export function isVoiceInputSupported() {
    return !!getSpeechRecognition();
}

export function isVoiceOutputSupported() {
    return typeof window !== "undefined" && "speechSynthesis" in window;
}

// Strips the markdown syntax that would otherwise be read aloud literally
// (asterisks, hashes, backticks, link brackets) — keeps the spoken text clean.
export function cleanForSpeech(markdownText) {
    return markdownText
        .replace(/```[\s\S]*?```/g, " code block omitted ")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/!\[.*?\]\(.*?\)/g, "")
        .replace(/\[(.*?)\]\(.*?\)/g, "$1")
        .replace(/[#>*_~-]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

export function speak(text, { onEnd } = {}) {
    if (!isVoiceOutputSupported() || !text) return;
    window.speechSynthesis.cancel(); // don't stack overlapping utterances
    const utterance = new SpeechSynthesisUtterance(cleanForSpeech(text));
    utterance.rate = 1;
    utterance.pitch = 1;
    if (onEnd) utterance.onend = onEnd;
    window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
    if (isVoiceOutputSupported()) window.speechSynthesis.cancel();
}