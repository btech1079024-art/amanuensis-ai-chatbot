import "./Chat.css";
import { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext.jsx";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import Logo from "./Logo.jsx";
import { IconCopy, IconCheck, IconVolume, IconVolumeOff, IconRefresh } from "./Icons.jsx";
import { isVoiceOutputSupported, speak, stopSpeaking } from "./utils/speech.js";

const voiceOutSupported = isVoiceOutputSupported();

function MessageActions({ idx, content, copiedIdx, onCopy, speakingIdx, onReadAloud, showRegenerate, onRegenerate, regenerating }) {
    return (
        <div className="messageActions">
            <button className="actionBtn" onClick={() => onCopy(idx, content)} aria-label="Copy message" title="Copy">
                {copiedIdx === idx ? <IconCheck size={13} /> : <IconCopy size={13} />}
            </button>
            {voiceOutSupported && (
                <button
                    className="actionBtn"
                    onClick={() => onReadAloud(idx, content)}
                    aria-label={speakingIdx === idx ? "Stop reading" : "Read aloud"}
                    title={speakingIdx === idx ? "Stop" : "Read aloud"}
                >
                    {speakingIdx === idx ? <IconVolumeOff size={13} /> : <IconVolume size={13} />}
                </button>
            )}
            {showRegenerate && (
                <button
                    className="actionBtn"
                    onClick={onRegenerate}
                    disabled={regenerating}
                    aria-label="Regenerate response"
                    title="Regenerate"
                >
                    <IconRefresh size={13} />
                </button>
            )}
        </div>
    );
}

function Chat({ onRegenerate, loading }) {
    const { prevChats, reply, currThreadId } = useContext(MyContext);
    const [latestReply, setLatestReply] = useState(null);
    const [copiedIdx, setCopiedIdx] = useState(null);
    const [speakingIdx, setSpeakingIdx] = useState(null);
    const bottomRef = useRef(null);

    // Switching threads shouldn't leave a message from the old one talking.
    useEffect(() => {
        stopSpeaking();
        setSpeakingIdx(null);
    }, [currThreadId]);

    useEffect(() => {
        if (reply === null) {
            setLatestReply(null); // loaded from history, no typing effect
            return;
        }
        if (!prevChats?.length) return;

        const content = reply.split(" ");
        let idx = 0;
        const interval = setInterval(() => {
            setLatestReply(content.slice(0, idx + 1).join(" "));
            idx++;
            if (idx >= content.length) clearInterval(interval);
        }, 40);

        return () => clearInterval(interval);
    }, [prevChats, reply]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ block: "end" });
    }, [latestReply, prevChats]);

    useEffect(() => () => stopSpeaking(), []);

    const handleCopy = async (idx, content) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(prev => (prev === idx ? null : prev)), 1500);
        } catch (err) {
            console.log(err);
        }
    };

    const handleReadAloud = (idx, content) => {
        if (speakingIdx === idx) {
            stopSpeaking();
            setSpeakingIdx(null);
            return;
        }
        setSpeakingIdx(idx);
        speak(content, { onEnd: () => setSpeakingIdx(prev => (prev === idx ? null : prev)) });
    };

    const lastIdx = prevChats.length - 1;

    return (
        <div className="chats">
            {prevChats?.slice(0, -1).map((chat, idx) => (
                <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
                    {chat.role === "user" ? (
                        <p className="userMessage">{chat.content}</p>
                    ) : (
                        <>
                            <Logo size={24} className="gptAvatar" />
                            <div className="gptMessageCol">
                                <div className="gptMessage">
                                    <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{chat.content}</ReactMarkdown>
                                </div>
                                <MessageActions
                                    idx={idx} content={chat.content}
                                    copiedIdx={copiedIdx} onCopy={handleCopy}
                                    speakingIdx={speakingIdx} onReadAloud={handleReadAloud}
                                />
                            </div>
                        </>
                    )}
                </div>
            ))}

            {prevChats.length > 0 && (() => {
                const finalContent = latestReply === null ? prevChats[lastIdx].content : latestReply;
                const isTyping = latestReply !== null;
                return (
                    <div className="gptDiv" key={isTyping ? "typing" : "non-typing"}>
                        <Logo size={24} className="gptAvatar" />
                        <div className="gptMessageCol">
                            <div className="gptMessage">
                                <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{finalContent}</ReactMarkdown>
                            </div>
                            {!isTyping && (
                                <MessageActions
                                    idx={lastIdx} content={finalContent}
                                    copiedIdx={copiedIdx} onCopy={handleCopy}
                                    speakingIdx={speakingIdx} onReadAloud={handleReadAloud}
                                    showRegenerate={!!onRegenerate} onRegenerate={onRegenerate} regenerating={loading}
                                />
                            )}
                        </div>
                    </div>
                );
            })()}
            <div ref={bottomRef} />
        </div>
    );
}

export default Chat;