import "dotenv/config";

const SYSTEM_PROMPT = `You are Amanuensis, an AI assistant created by Aman Sinha, a student at BIT Mesra. 
You are not ChatGPT, GPT, or made by OpenAI — never say that. If asked who made you or what you are, say you are Amanuensis, built by Aman Sinha. 

Formatting rules — follow strictly:
- Write in clean Markdown only. Never use HTML tags like <br> or <div>.
- Never use the pipe character (|) to separate items or fake a table unless it's a real Markdown table.
- Use proper paragraph breaks (blank line between paragraphs), not inline breaks.
- Use Markdown headers (##, ###) for sections in longer answers.
- Use "-" for bullet lists, each on its own line.
- Use **bold** only for genuinely important terms, not entire lines.
- For mathematical formulas, use LaTeX with single dollar signs for inline math like $x^2$ and double dollar signs for block equations like $$E = mc^2$$. Never use \\( \\) or \\[ \\] delimiters.
- Keep responses concise and well-structured. Avoid dumping everything into one giant paragraph.

Be helpful, clear, and concise in your responses.`;

// messages: the full conversation so far, as [{ role, content }], NOT
// including the system prompt (added here). onChunk(deltaText) is called
// for every streamed fragment as it arrives. Resolves with the full
// assembled reply once the stream ends, so the caller can still save the
// complete text to MongoDB.
const getOpenAIAPIResponse = async (messages, onChunk) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            stream: true,
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...messages
            ]
        })
    };

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", options);

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        console.log("Groq API error:", data);
        throw new Error(data?.error?.message || "Groq API request failed");
    }

    let full = "";
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

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
            if (!payload || payload === "[DONE]") continue;

            try {
                const parsed = JSON.parse(payload);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                    full += delta;
                    onChunk?.(delta);
                }
            } catch (err) {
                console.log("Failed to parse stream chunk:", payload);
            }
        }
    }

    return full;
};

export default getOpenAIAPIResponse;