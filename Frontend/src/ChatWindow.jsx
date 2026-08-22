import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import Logo from "./Logo.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import {
    IconMenu, IconChevronDown, IconUser, IconSettings, IconSpark, IconLogout,
    IconSend, IconMic, IconVolume, IconVolumeOff, IconSwatches,
} from "./Icons.jsx";
import { getSpeechRecognition, isVoiceOutputSupported, speak, stopSpeaking } from "./utils/speech.js";

const STARTERS = [
    "Explain a tricky concept simply",
    "Help me draft an email",
    "Review this code for bugs",
];

const THEMES = [
    { id: "violet", label: "Obsidian Gold", preview: "linear-gradient(135deg,#FFD60A,#FFB800)" },
    { id: "citrus", label: "Citrus Pop", preview: "linear-gradient(135deg,#c6ff3f,#ff9f3f)" },
    { id: "flame", label: "Flame", preview: "linear-gradient(135deg,#ff4d6d,#ffb13f)" },
    { id: "ocean", label: "Ocean", preview: "linear-gradient(135deg,#3fd4ff,#8b5cf6)" },
];

const AUTOREAD_KEY = "amanuensis-autoread";

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
}

function ChatWindow() {
    const {
        prompt, setPrompt, reply, setReply, currThreadId,
        setPrevChats, newChat, setNewChat, prevChats,
        sidebarOpen, setSidebarOpen, theme, setTheme,
        token, user, logout,
    } = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [listening, setListening] = useState(false);
    const [autoRead, setAutoRead] = useState(() => localStorage.getItem(AUTOREAD_KEY) === "true");
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);
    const voiceSupported = !!getSpeechRecognition();
    const voiceOutSupported = isVoiceOutputSupported();

    useEffect(() => {
        const SR = getSpeechRecognition();
        if (!SR) return;
        const recognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.onresult = (e) => {
            let transcript = "";
            for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
            setPrompt(transcript);
        };
        recognition.onend = () => setListening(false);
        recognition.onerror = () => setListening(false);
        recognitionRef.current = recognition;

        return () => {
            recognition.onresult = null;
            recognition.onend = null;
            recognition.onerror = null;
        };
    }, []);

    useEffect(() => {
        localStorage.setItem(AUTOREAD_KEY, String(autoRead));
    }, [autoRead]);

    useEffect(() => {
        if (autoRead && reply) speak(reply);
    }, [reply, autoRead]);

    useEffect(() => () => stopSpeaking(), []);
    useEffect(() => { stopSpeaking(); }, [currThreadId]);

    const toggleListening = () => {
        if (!recognitionRef.current) return;
        if (listening) {
            recognitionRef.current.stop();
            setListening(false);
        } else {
            setPrompt("");
            try {
                recognitionRef.current.start();
                setListening(true);
            } catch (err) {
                console.log(err);
            }
        }
    };

    const handleToggleAutoRead = () => {
        setAutoRead(v => {
            const next = !v;
            if (!next) stopSpeaking();
            return next;
        });
    };

    const getReply = async () => {
        if (!prompt.trim() || loading) return;
        if (listening) {
            recognitionRef.current?.stop();
            setListening(false);
        }

        setLoading(true);
        setNewChat(false);

        try {
            const response = await fetch("http://localhost:8080/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ message: prompt, threadId: currThreadId }),
            });
            const res = await response.json();
            if (!response.ok) {
                console.log("Chat error:", res);
                setLoading(false);
                return;
            }
            setReply(res.reply);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (prompt && reply) {
            setPrevChats(prevChats => ([
                ...prevChats,
                { role: "user", content: prompt },
                { role: "assistant", content: reply },
            ]));
        }
        setPrompt("");
    }, [reply]);

    const regenerate = async () => {
        if (loading) return;
        const lastUser = [...prevChats].reverse().find(c => c.role === "user");
        if (!lastUser) return;

        setLoading(true);
        try {
            const response = await fetch("http://localhost:8080/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ message: lastUser.content, threadId: currThreadId }),
            });
            const res = await response.json();
            setPrevChats(prev => {
                const updated = [...prev];
                for (let i = updated.length - 1; i >= 0; i--) {
                    if (updated[i].role === "assistant") {
                        updated[i] = { role: "assistant", content: res.reply };
                        break;
                    }
                }
                return updated;
            });
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    const handleStarter = (text) => {
        setPrompt(text);
        inputRef.current?.focus();
    };

    const firstName = user?.name?.split(" ")[0] || "there";

    return (
        <div className="chatWindow">
            <div className="navbar">
                <div className="navbarLeft">
                    <button className="iconBtn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
                        <IconMenu size={18} />
                    </button>
                    <span className="modelTag">
                        Amanuensis <span className="modelVersion">· v1</span>
                        <IconChevronDown size={11} />
                    </span>
                </div>

                <div className="userIconDiv" onClick={() => setIsOpen(!isOpen)}>
                    <span className="userIcon"><IconUser size={15} /></span>
                </div>

                {isOpen && (
                    <div className="dropDown">
                        <p className="dropDownLabel"><IconSwatches size={13} /> Appearance</p>
                        <div className="swatchRow">
                            {THEMES.map(t => (
                                <button
                                    key={t.id}
                                    className={`swatch ${theme === t.id ? "swatch--active" : ""}`}
                                    style={{ background: t.preview }}
                                    onClick={() => setTheme(t.id)}
                                    aria-label={t.label}
                                    title={t.label}
                                />
                            ))}
                        </div>

                        <div className="dropDownDivider" />

                        {voiceOutSupported && (
                            <div className="dropDownItem" onClick={handleToggleAutoRead}>
                                {autoRead ? <IconVolume size={15} /> : <IconVolumeOff size={15} />}
                                <span>Read replies aloud</span>
                                <span className={`toggle ${autoRead ? "toggle--on" : ""}`} />
                            </div>
                        )}
                        <div className="dropDownItem"><IconSettings size={15} /> Settings</div>
                        <div className="dropDownItem"><IconSpark size={15} /> Upgrade plan</div>
                        <div className="dropDownItem dropDownItem--danger" onClick={logout}>
                            <IconLogout size={15} /> Log out
                        </div>
                    </div>
                )}
            </div>

            {newChat && prevChats.length === 0 ? (
                <div className="hero">
                    <Logo size={56} animated className="heroMark" />
                    <h1 className="heroTitle">{getGreeting()}, {firstName}</h1>
                    <p className="heroSub">Ask anything — Amanuensis is ready when you are.</p>
                    <div className="starterRow">
                        {STARTERS.map((s, i) => (
                            <button key={i} className="starterChip" onClick={() => handleStarter(s)}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <Chat onRegenerate={regenerate} loading={loading} />
            )}

            {loading && (
                <div className="thinking" aria-live="polite">
                    <span className="thinkingBlob" />
                    <span className="thinkingText">Amanuensis is thinking…</span>
                </div>
            )}

            <div className="chatInput">
                <div className="inputBox">
                    <input
                        ref={inputRef}
                        placeholder={listening ? "Listening…" : "Ask anything"}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" ? getReply() : null}
                    />
                    <div className="inputActions">
                        {voiceSupported && (
                            <button
                                type="button"
                                className={`micBtn ${listening ? "micBtn--active" : ""}`}
                                onClick={toggleListening}
                                aria-label={listening ? "Stop voice input" : "Start voice input"}
                                title={listening ? "Stop voice input" : "Start voice input"}
                            >
                                {listening && <span className="micPulse" />}
                                <IconMic size={15} />
                            </button>
                        )}
                        <button
                            id="submit"
                            onClick={getReply}
                            disabled={!prompt.trim() || loading}
                            aria-label="Send message"
                        >
                            <IconSend size={16} />
                        </button>
                    </div>
                </div>
                <p className="info">
                    Amanuensis can make mistakes. Check important info.
                </p>
            </div>
        </div>
    );
}

export default ChatWindow;

