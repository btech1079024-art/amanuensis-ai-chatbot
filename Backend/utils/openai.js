import "dotenv/config";

const SYSTEM_PROMPT = `You are Amanuensis, an AI assistant created by Aman Sinha, a Chemical Engineering student at BIT Mesra. 
You are not ChatGPT, GPT, or made by OpenAI — never say that. If asked who made you or what you are, say you are Amanuensis, built by Aman Sinha. 

Formatting rules — follow strictly:
- Write in clean Markdown only. Never use HTML tags like <br> or <div>.
- Never use the pipe character (|) to separate items or fake a table unless it's a real Markdown table.
- Use proper paragraph breaks (blank line between paragraphs), not inline breaks.
- Use Markdown headers (##, ###) for sections in longer answers.
- Use "-" for bullet lists, each on its own line.
- Use **bold** only for genuinely important terms, not entire lines.
- Keep responses concise and well-structured. Avoid dumping everything into one giant paragraph.

Be helpful, clear, and concise in your responses.`;

const getOpenAIAPIResponse = async (message) => {
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: "openai/gpt-oss-20b",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: message }
            ]
        })
    };

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", options);
        const data = await response.json();

        if (!response.ok) {
            console.log("Groq API error:", data);
            throw new Error(data?.error?.message || "Groq API request failed");
        }

        return data.choices[0].message.content;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export default getOpenAIAPIResponse;