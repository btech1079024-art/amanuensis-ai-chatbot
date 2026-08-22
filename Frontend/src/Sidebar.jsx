import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import { IconCompose, IconTrash } from "./Icons.jsx";
import Logo from "./Logo.jsx";

function Sidebar() {
    const {
        allThreads, setAllThreads,
        currThreadId, setCurrThreadId,
        setNewChat, setPrompt, setReply, setPrevChats,
        sidebarOpen, token,
    } = useContext(MyContext);

    const authHeaders = { "Authorization": `Bearer ${token}` };

    const getAllThreads = async () => {
        if (!token) return;
        try {
            const response = await fetch("http://localhost:8080/api/thread", {
                headers: authHeaders
            });
            const res = await response.json();
            if (!response.ok || !Array.isArray(res)) {
                console.log("Failed to load threads:", res);
                return;
            }
            const filteredData = res.map(thread => ({ threadId: thread.threadId, title: thread.title }));
            setAllThreads(filteredData);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [currThreadId, token]);

    const createNewChat = () => {
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setCurrThreadId(uuidv1());
        setPrevChats([]);
    };

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);
        try {
            const response = await fetch(`http://localhost:8080/api/thread/${newThreadId}`, {
                headers: authHeaders
            });
            const res = await response.json();
            setPrevChats(res);
            setNewChat(false);
            setReply(null);
        } catch (err) {
            console.log(err);
        }
    };

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(`http://localhost:8080/api/thread/${threadId}`, {
                method: "DELETE",
                headers: authHeaders
            });
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