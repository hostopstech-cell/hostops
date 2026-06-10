"use client";
import { useState, useEffect, useRef } from "react";

export default function BookPage({ params }: { params: { propertyId: string } }) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [property, setProperty] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sendMessage("Hello", true);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string, auto = false) {
    const userMsg = { role: "user", content: text };
    const newMessages = auto ? [userMsg] : [...messages, userMsg];
    if (!auto) setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`/api/chat/${params.propertyId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages(prev => [...(auto ? [] : prev), ...(auto ? [userMsg] : []), { role: "assistant", content: "Sorry, this booking bot is not available right now." }]);
        setLoading(false);
        return;
      }
      if (data.property) setProperty(data.property);
      const reply = data.reply || "";
      setMessages(prev => [...(auto ? [] : prev), ...(auto ? [userMsg] : []), { role: "assistant", content: reply }]);

      if (reply.includes("BOOKING_READY:")) {
        const match = reply.match(/BOOKING_READY:\s*name=\[?([^\],\n]+)\]?,\s*phone=\[?([^\],\n]+)\]?,\s*checkin=\[?([^\],\n]+)\]?,\s*checkout=\[?([^\],\n]+)\]?,\s*guests=\[?([^\],\n]+)\]?,\s*room=\[?([^\],\n]+)\]?,\s*amount=\[?([^\],\n]+)\]?(?:,\s*idtype=\[?([^\],\n]*)\]?)?(?:,\s*idnumber=\[?([^\],\n]*)\]?)?(?:,\s*utr=\[?([^\],\n]*)\]?)?(?:,\s*sender=\[?([^\],\n]*)\]?)?(?:,\s*paydate=\[?([^\],\n]*)\]?)?/);
        if (match) {
          const nights = Math.max(1, Math.round((new Date(match[4]).getTime() - new Date(match[3]).getTime()) / 86400000));
          const pricePerNight = parseFloat(match[7]) || 0;
          const totalAmount = pricePerNight * nights;
          await fetch("/api/chat/booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              propertyId: params.propertyId,
              name: match[1]?.trim(), phone: match[2]?.trim(),
              checkin: match[3]?.trim(), checkout: match[4]?.trim(),
              guests: parseInt(match[5]) || 1,
              room: match[6]?.trim(), amount: totalAmount || pricePerNight,
              idtype: match[8]?.trim() || null, idnumber: match[9]?.trim() || null,
              utr: match[10]?.trim() || null, sender: match[11]?.trim() || null,
              paydate: match[12]?.trim() || null,
            }),
          });
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }]);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 to-indigo-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col" style={{ height: "85vh" }}>
        <div className="bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">🏨</div>
            <div>
              <h1 className="text-white font-bold text-lg">{property?.name || "Loading..."}</h1>
              <p className="text-white/70 text-xs">{property?.city} · {property?.type}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.filter(m => !m.content.includes("BOOKING_READY:")).map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-indigo-500 text-white rounded-br-sm"
                  : "bg-slate-100 text-slate-800 rounded-bl-sm"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && input.trim() && sendMessage(input.trim())}
              placeholder="Type your message..."
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400" style={{color: "#000", background: "#fff"}}
            />
            <button
              onClick={() => !loading && input.trim() && sendMessage(input.trim())}
              disabled={loading || !input.trim()}
              className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white disabled:opacity-50"
            >
              ➤
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-300 mt-2">Powered by HostOps</p>
        </div>
      </div>
    </div>
  );
}
