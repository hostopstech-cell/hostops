"use client";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Property {
  name: string;
  city: string;
  type: string;
  contact: string;
}

export default function BookingPage({ params }: { params: { propertyId: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [bookingDone, setBookingDone] = useState(false);
  const [bookingCode, setBookingCode] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sendMessage("Hello! I want to know about this property.", true);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string, auto = false) {
    if (!text.trim()) return;
    const userMsg: Message = { role: "user", content: text };
    const newMessages = auto ? [] : [...messages, userMsg];
    if (!auto) {
      setMessages(prev => [...prev, userMsg]);
      setInput("");
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/chat/${params.propertyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: auto ? [userMsg] : newMessages }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages(prev => [...prev, { role: "assistant", content: "Sorry, this property is not available." }]);
        setLoading(false);
        return;
      }
      if (data.property) setProperty(data.property);
      const reply = data.reply;
      setMessages(prev => [...(auto ? [] : prev), ...(auto ? [userMsg] : []), { role: "assistant", content: reply }]);

      if (reply.includes("BOOKING_READY:")) {
        const match = reply.match(/BOOKING_READY:\s*name=\[(.+?)\],\s*phone=\[(.+?)\],\s*checkin=\[(.+?)\],\s*checkout=\[(.+?)\],\s*guests=\[(.+?)\],\s*room=\[(.+?)\],\s*amount=\[(.+?)\](?:,\s*idtype=\[(.+?)\])?(?:,\s*idnumber=\[(.+?)\])?(?:,\s*utr=\[(.+?)\])?(?:,\s*sender=\[(.+?)\])?(?:,\s*paydate=\[(.+?)\])?/);
        if (match) {
          const nights = Math.max(1, Math.round((new Date(match[4]).getTime() - new Date(match[3]).getTime()) / 86400000));
          const pricePerNight = parseFloat(match[7]) || 0;
          const totalAmount = pricePerNight * parseInt(match[5]) * nights;
          const bookRes = await fetch("/api/chat/booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              propertyId: params.propertyId,
              name: match[1], phone: match[2], checkin: match[3],
              checkout: match[4], guests: parseInt(match[5]),
              room: match[6], amount: totalAmount || pricePerNight,
              idtype: match[8] || null, idnumber: match[9] || null,
              utr: match[10] || null, sender: match[11] || null, paydate: match[12] || null,
            }),
          });
          const bookData = await bookRes.json();
          if (bookData.success) {
            setBookingDone(true);
            setBookingCode(bookData.booking_code);
          }
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "480px", background: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 25px 60px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", height: "90vh" }}>
        
        <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "20px", color: "white" }}>
          <div style={{ fontSize: "24px", marginBottom: "4px" }}>🏨</div>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>{property?.name || "Loading..."}</h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", opacity: 0.85 }}>{property ? `${property.city} • ${property.type}` : "Finding property..."}</p>
        </div>

        {bookingDone && (
          <div style={{ background: "#d4edda", border: "1px solid #c3e6cb", margin: "12px", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "32px" }}>✅</div>
            <p style={{ margin: "8px 0 4px", fontWeight: "700", color: "#155724" }}>Booking Confirmed!</p>
            <p style={{ margin: 0, color: "#155724", fontSize: "14px" }}>Code: <strong>{bookingCode}</strong></p>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "80%", padding: "10px 14px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: msg.role === "user" ? "linear-gradient(135deg, #667eea, #764ba2)" : "#f0f0f0",
                color: msg.role === "user" ? "white" : "#333",
                fontSize: "14px", lineHeight: "1.5",
                whiteSpace: "pre-wrap",
              }}>
                {msg.role === "assistant" && msg.content.includes("BOOKING_READY:") 
                  ? "Your booking details have been confirmed! Please check below." 
                  : msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ background: "#f0f0f0", borderRadius: "18px 18px 18px 4px", padding: "10px 14px", fontSize: "20px" }}>...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div style={{ padding: "12px 16px", borderTop: "1px solid #eee", display: "flex", gap: "8px" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && sendMessage(input)}
            placeholder="Type your message..."
            style={{ flex: 1, border: "2px solid #e0e0e0", borderRadius: "24px", padding: "10px 16px", fontSize: "14px", outline: "none", color: "#111" }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white", border: "none", borderRadius: "50%", width: "44px", height: "44px", cursor: "pointer", fontSize: "18px" }}
          >
            ➤
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: "11px", color: "#aaa", padding: "8px", margin: 0 }}>
          Powered by HostOps
        </p>
      </div>
    </div>
  );
}
