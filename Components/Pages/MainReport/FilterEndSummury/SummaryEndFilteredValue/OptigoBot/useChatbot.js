import { useState, useCallback, useRef, useEffect } from "react";
import sendChatMessage from "@/API/LLMApi/optigoBotChat";

const readUserId = () => {
  if (typeof window === "undefined") return "anonymous";
  try {
    const raw = sessionStorage.getItem("reportVarible");
    if (!raw) return "anonymous";
    const data = JSON.parse(raw);
    return data?.LUId || "anonymous";
  } catch {
    return "anonymous";
  }
};

export function useChatbot({ responseMode = "wide" } = {}) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const sessionIdRef = useRef(null);
  const idCounterRef = useRef(0);
  const abortRef = useRef(null);
  const userIdRef = useRef(readUserId());

  const nextId = () => ++idCounterRef.current;

  const resetChat = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    sessionIdRef.current = null;
    setMessages([]);
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (question) => {
      const trimmed = (question || "").trim();
      if (!trimmed || isLoading) return;

      const userMsg = {
        id: nextId(),
        role: "user",
        blocks: [{ type: "text", content: trimmed }],
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await sendChatMessage(
          {
            question: trimmed,
            user_id: userIdRef.current,
            session_id: sessionIdRef.current || undefined,
            response_mode: responseMode,
          },
          ctrl.signal
        );

        if (res?.session_id) {
          sessionIdRef.current = res.session_id;
        }

        const botBlocks =
          (Array.isArray(res?.blocks) && res.blocks.length
            ? res.blocks
            : res?.error
              ? [{ type: "error", content: res.error }]
              : [{ type: "text", content: res?.answer || "No response received." }]);

        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: "assistant", blocks: botBlocks, raw: res },
        ]);
      } catch (err) {
        if (err?.name === "AbortError") return;
        setMessages((prev) => [
          ...prev,
          {
            id: nextId(),
            role: "assistant",
            blocks: [
              {
                type: "error",
                content: "The assistant is temporarily unavailable. Please try again.",
              },
            ],
          },
        ]);
      } finally {
        if (abortRef.current === ctrl) abortRef.current = null;
        setIsLoading(false);
      }
    },
    [isLoading, responseMode]
  );

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { messages, isLoading, sendMessage, resetChat };
};

export default useChatbot;
