import "./Chat.css";
import { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext.jsx";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import "highlight.js/styles/github-dark.css";
import "katex/dist/katex.min.css";
import Logo from "./Logo.jsx";
import { IconCopy, IconCheck, IconVolume, IconVolumeOff, IconRefresh } from "./icons.jsx";
import { isVoiceOutputSupported, speak, stopSpeaking } from "./utils/speech.js";
import { normalizeLatexDelimiters } from "./utils/markdown.js";

const voiceOutSupported = isVoiceOutputSupported();

const mdComponents = {
    table: ({ node, ...props }) => (
        <div className="tableWrap"><table {...props} /></div>
    ),
};

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

// `loading` = a request is in flight. Since replies now stream in for real
// (no more fake word-by-word typing), the only thing this component needs
// to know is whether the LAST message is still actively receiving chunks,
// so it can hide that one message's action row until it's done.
function Chat({ onRegenerate, loading }) {
    const { prevChats, currThreadId } = useContext(MyContext);
    const [copiedIdx, setCopiedIdx] = useState(null);
    const [speakingIdx, setSpeakingIdx] = useState(null);
    const bottomRef = useRef(null);

    // Switching threads shouldn't leave a message from the old one talking.
    useEffect(() => {
        stopSpeaking();
        setSpeakingIdx(null);
    }, [currThreadId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ block: "end" });
    }, [prevChats]);

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
    const isLastStreaming = loading && prevChats[lastIdx]?.role === "assistant";

    return (
        <div className="chats">
            {prevChats.map((chat, idx) => (
                <div className={chat.role === "user" ? "userDiv" : "gptDiv"} key={idx}>
                    {chat.role === "user" ? (
                        <p className="userMessage">{chat.content}</p>
                    ) : (
                        <>
                            <Logo size={24} className="gptAvatar" />
                            <div className="gptMessageCol">
                                <div className="gptMessage">
                                    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeHighlight, rehypeKatex]} components={mdComponents}>
                                        {normalizeLatexDelimiters(chat.content)}
                                    </ReactMarkdown>
                                </div>
                                {!(idx === lastIdx && isLastStreaming) && (
                                    <MessageActions
                                        idx={idx} content={chat.content}
                                        copiedIdx={copiedIdx} onCopy={handleCopy}
                                        speakingIdx={speakingIdx} onReadAloud={handleReadAloud}
                                        showRegenerate={idx === lastIdx && !!onRegenerate}
                                        onRegenerate={onRegenerate} regenerating={loading}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>
            ))}
            <div ref={bottomRef} />
        </div>
    );
}

export default Chat;