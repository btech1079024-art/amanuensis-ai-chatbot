import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import { IconCompose, IconTrash, IconFolder, IconArtifact, IconSpark } from "./icons.jsx";
import Logo from "./Logo.jsx";
import { api } from "./utils/api.js";

function Sidebar() {
    const {
        allThreads, setAllThreads,
        currThreadId, setCurrThreadId,
        setNewChat, setPrompt, setPrevChats,
        sidebarOpen, setShowUpgrade,
    } = useContext(MyContext);

    const getAllThreads = async () => {
        try {
            const response = await api.get("/api/thread");
            if (!response.ok) return;
            const res = await response.json();
            const filteredData = res.map(thread => ({ threadId: thread.threadId, title: thread.title }));
            setAllThreads(filteredData);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    };

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        try {
            const response = await api.get(`/api/thread/${newThreadId}`);
            if (!response.ok) return;
            const res = await response.json();
            setPrevChats(res);
            setNewChat(false);
        } catch (err) {
            console.log(err);
        }
    };

    const deleteThread = async (threadId) => {
        try {
            const response = await api.del(`/api/thread/${threadId}`);
            if (!response.ok) return;
            await response.json();
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));
            if (threadId === currThreadId) {
                createNewChat();
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <section className={`sidebar ${sidebarOpen ? "" : "sidebar--collapsed"}`}>
            <div className="brand">
                <Logo size={30} />
                <span className="brandName">Amanuensis</span>
            </div>

            <button className="newChatBtn" onClick={createNewChat}>
                <IconCompose size={16} />
                <span>New chat</span>
            </button>

            <nav className="sidebarNav">
                <button className="navItem" disabled title="Coming soon">
                    <IconFolder size={16} />
                    <span>Projects</span>
                    <span className="navBadge">Soon</span>
                </button>
                <button className="navItem" disabled title="Coming soon">
                    <IconArtifact size={16} />
                    <span>Artifacts</span>
                    <span className="navBadge">Soon</span>
                </button>
                <button className="navItem navItem--upgrade" onClick={() => setShowUpgrade(true)}>
                    <IconSpark size={16} />
                    <span>Upgrade</span>
                </button>
            </nav>

            <div className="threadsBlock">
                <p className="threadsEyebrow">Recent</p>
                {allThreads?.length ? (
                    <ul className="threadList">
                        {allThreads.map((thread, idx) => (
                            <li
                                key={idx}
                                onClick={() => changeThread(thread.threadId)}
                                className={`threadItem ${thread.threadId === currThreadId ? "threadItem--active" : ""}`}
                            >
                                <span className="threadTitle">{thread.title}</span>
                                <button
                                    className="deleteBtn"
                                    aria-label="Delete conversation"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteThread(thread.threadId);
                                    }}
                                >
                                    <IconTrash size={14} />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="threadsEmpty">No conversations yet</p>
                )}
            </div>

            <div className="sidebarFooter">
                <p>Crafted by Aman Sinha · BIT Mesra</p>
            </div>
        </section>
    );
}

export default Sidebar;