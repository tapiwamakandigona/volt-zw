"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { askVolt } from "@/lib/ai";

interface Msg {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "How does the stepped ZESA tariff work?",
  "How many units will $20 get me right now?",
  "Tips to make my tokens last longer",
  "What do I do if I lost my token receipt?",
];

const GREETING =
  "Hi! I'm VoltZW's assistant ⚡ Ask me anything about ZESA tokens, tariffs, " +
  "saving electricity, or how to use the app.";

export default function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setBusy(true);
    try {
      const answer = await askVolt(q);
      setMessages((m) => [...m, { role: "assistant", text: answer }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="Ask VoltZW">
      <section className="animate-fade-in-up flex min-h-[70vh] flex-col">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-600/15 text-primary-400">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold">Ask VoltZW</h1>
            <p className="text-xs text-muted">Your free ZESA & electricity helper.</p>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {messages.map((m, i) => (
            <Bubble key={i} role={m.role} text={m.text} />
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-xs text-muted">
              <Loader2 className="h-4 w-4 animate-spin" /> VoltZW is thinking…
            </div>
          )}
          {messages.length <= 1 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-panel px-3 py-1.5 text-xs text-muted transition-colors hover:border-primary-600 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="sticky bottom-20 mt-4 flex items-center gap-2 md:bottom-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about tokens, tariffs, savings…"
            className="flex-1 rounded-xl border border-border bg-panel px-4 py-3 text-sm outline-none focus:border-primary-600"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </section>
    </AppShell>
  );
}

function Bubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  const isUser = role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed " +
          (isUser
            ? "rounded-br-sm bg-primary-600 text-white"
            : "rounded-bl-sm border border-border bg-panel text-white/90")
        }
      >
        {text}
      </div>
    </div>
  );
}
