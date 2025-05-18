"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  sentAt: string;
}

export default function ChatPage() {
  const [friendId, setFriendId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");

  const fetchMessages = async () => {
    if (!friendId) return;

    try {
      const res = await axios.get<ChatMessage[]>(
        `https://localhost:7072/api/chat/messages/${friendId}`,
        { withCredentials: true }
      );
      setMessages(res.data);
      setError("");
    } catch (err: any) {
      setMessages([]);
      if (err.response?.status === 403) {
        setError("You are not friends with this user.");
      } else if (err.response?.status === 401) {
        setError("You must be logged in.");
      } else {
        setError("Error loading messages.");
      }
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !friendId) return;

    try {
      await axios.post(
        "https://localhost:7072/api/chat/send",
        {
          receiverId: friendId,
          message: message.trim(),
        },
        { withCredentials: true }
      );
      setMessage("");
      await fetchMessages();
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError("You can't message this user.");
      } else {
        setError("Failed to send message.");
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (friendId) fetchMessages();
    }, 2000);

    return () => clearInterval(interval);
  }, [friendId]);

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 20 }}>
      <h2>💬 Chat</h2>

      <div style={{ marginBottom: 16 }}>
        <label>Enter Friend's User ID:</label>
        <input
          type="number"
          value={friendId ?? ""}
          onChange={(e) => setFriendId(Number(e.target.value))}
          placeholder="e.g., 2"
          style={{ width: "100%", padding: 8 }}
        />
        <button
          onClick={fetchMessages}
          style={{ marginTop: 8, padding: "6px 12px" }}
        >
          Load Messages
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 4,
          height: 250,
          overflowY: "auto",
          padding: 10,
          marginBottom: 16,
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              marginBottom: 10,
              textAlign: m.senderId === friendId ? "left" : "right",
            }}
          >
            <span
              style={{
                backgroundColor: "#f0f0f0",
                padding: "4px 8px",
                borderRadius: 4,
                display: "inline-block",
              }}
            >
              {m.message}
            </span>
            <div style={{ fontSize: 10, color: "#888" }}>
              {new Date(m.sentAt).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={sendMessage} style={{ padding: "8px 12px" }}>
          Send
        </button>
      </div>
    </div>
  );
}
