import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import Logo from "./Logo.jsx";
import UpgradeModal from "./UpgradeModal.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState, useEffect, useRef } from "react";
import {
    IconMenu, IconChevronDown, IconUser, IconSettings, IconSpark, IconLogout,
    IconSend, IconMic, IconVolume, IconVolumeOff, IconSwatches,
} from "./icons.jsx";
import { getSpeechRecognition, isVoiceOutputSupported, speak, stopSpeaking } from "./utils/speech.js";
import { api } from "./utils/api.js";

const STARTERS = [
    "Explain a tricky concept simply",
    "Help me draft an email",
    "Review this code for bugs",
];

const THEMES = [
    { id: "violet", label: "Violet Ink", preview: "linear-gradient(135deg,#8b5cf6,#ff4d6d)" },
    { id: "citrus", label: "Citrus Pop", preview: "linear-gradient(135deg,#c6ff3f,#ff9f3f)" },
    { id: "flame", label: "Flame", preview: "linear-gradient(135deg,#ff4d6d,#ffb13f)" },
    { id: "ocean", label: "Ocean", preview: "linear-gradient(135deg,#3fd4ff,#8b5cf6)" },
];

const AUTOREAD_KEY = "amanuensis-autoread";

function ChatWindow() {
    const {
        prompt, setPrompt, reply, setReply, currThreadId,
        setPrevChats, newChat, setNewChat, prevChats,
        sidebarOpen, setSidebarOpen, theme, setTheme,
        user, onLogout, showUpgrade, setShowUpgrade,
    } = useContext(MyContext);

    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [listening, setListening] = useState(false);
    const [autoRead, setAutoRead] = useState(() => localStorage.getItem(AUTOREAD_KEY) === "true");
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);
    const voiceSupported = !!getSpeechRecognition();
    const voiceOutSupported = isVoiceOutputSupported();

    // Set up voice input once.
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

    // Read replies aloud when auto-read is on.
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
            const response = await api.post("/api/chat", { message: prompt, threadId: currThreadId });
            if (!response.ok) throw new Error("Request failed");
            const res = await response.json();
            setReply(res.reply);
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    // Append new chat to prevChats
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

    // Re-send the last user message and swap the last assistant reply for a
    // fresh one — deliberately bypasses the reply/prompt state above so it
    // can't duplicate the user turn.
    const regenerate = async () => {
        if (loading) return;
        const lastUser = [...prevChats].reverse().find(c => c.role === "user");
        if (!lastUser) return;

        setLoading(true);
        try {
            const response = await api.post("/api/chat", { message: lastUser.content, threadId: currThreadId });
            if (!response.ok) throw new Error("Request failed");
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
                    <span className="userIcon">
                        {user?.name ? user.name.charAt(0).toUpperCase() : <IconUser size={15} />}
                    </span>
                </div>

                {isOpen && (
                    <div className="dropDown">
                        {user && (
                            <>
                                <div className="dropDownUser">
                                    <p className="dropDownUserName">{user.name}</p>
                                    <p className="dropDownUserEmail">{user.email}</p>
                                </div>
                                <div className="dropDownDivider" />
                            </>
                        )}
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
                        <div
                            className="dropDownItem"
                            onClick={() => { setIsOpen(false); setShowUpgrade(true); }}
                        >
                            <IconSpark size={15} /> Upgrade plan
                        </div>
                        <div
                            className="dropDownItem dropDownItem--danger"
                            onClick={() => { setIsOpen(false); onLogout?.(); }}
                        >
                            <IconLogout size={15} /> Log out
                        </div>
                    </div>
                )}
            </div>

            {newChat && prevChats.length === 0 ? (
                <div className="hero">
                    <div className="heroBlobs" aria-hidden="true">
                        <span className="heroBlob heroBlob--a" />
                        <span className="heroBlob heroBlob--b" />
                    </div>
                    <Logo size={56} animated className="heroMark" />
                    <h1 className="heroTitle">What's on your mind?</h1>
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

            {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
        </div>
    );
}

export default ChatWindow;