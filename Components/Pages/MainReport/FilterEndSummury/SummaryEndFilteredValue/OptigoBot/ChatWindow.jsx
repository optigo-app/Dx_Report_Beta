import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  InputBase,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { PencilLine, X } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { useChatbot } from "./useChatbot";

const PREMADE_QUESTIONS_MASTER = [
  {
    matchers: ["/mainreport", "pid="],
    suggestions: [
      "Total sales",
      "Show top 5 insights",
      "Summarize this report",
      "What changed from last period?",
    ],
  },
  {
    matchers: ["/home.do", "/home1.do"],
    suggestions: [
      "What should I focus on today?",
      "Show key performance summary",
      "List biggest opportunities",
    ],
  },
];

const DEFAULT_SUGGESTIONS = [
  "Show top 5 insights",
  "Summarize this report",
  "What changed from last period?",
];

const getUrlWiseSuggestions = (url) => {
  const normalizedUrl = (url || "").toLowerCase();
  const matchedRule = PREMADE_QUESTIONS_MASTER.find((rule) =>
    rule.matchers.some((matcher) => normalizedUrl.includes(matcher))
  );
  return matchedRule?.suggestions ?? DEFAULT_SUGGESTIONS;
};

export default function ChatWindow({ onClose }) {
  const { messages, isLoading, sendMessage, resetChat } = useChatbot();
  const [inputValue, setInputValue] = useState("");
  const [currentUrl] = useState(() =>
    typeof window !== "undefined" ? window.location.href : ""
  );
  const scrollRef = useRef(null);

  const suggestions = getUrlWiseSuggestions(currentUrl);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = (text) => {
    const next = (text ?? inputValue).trim();
    if (!next || isLoading) return;
    setInputValue("");
    sendMessage(next);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    resetChat();
    setInputValue("");
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box
        sx={{
          px: 1.5,
          py: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title="New chat">
            <IconButton
              onClick={handleNewChat}
              size="small"
              sx={{
                color: "var(--primary-btncolor-start)",
                backgroundColor: "#efe8ff",
                border: "1px solid #dfd1ff",
                "&:hover": { backgroundColor: "#e7dbff" },
              }}
            >
              <PencilLine size={16} />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} size="small" sx={{ color: "#5f6368" }}>
            <X size={20} />
          </IconButton>
        </Box>
      </Box>

      <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", px: 2, py: 1 }}>
        {messages.length === 0 ? (
          <Box sx={{ mt: 4 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 500, color: "var(--primary-btncolor-start)", mb: 0.5 }}
            >
              Hello
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "#202124", fontWeight: 400, mb: 3 }}
            >
              How can I help you today?
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {suggestions.map((question, i) => (
                <Button
                  key={i}
                  variant="contained"
                  onClick={() => handleSend(question)}
                  sx={{
                    justifyContent: "flex-start",
                    textTransform: "none",
                    backgroundColor: "#f1f3f4",
                    color: "#3c4043",
                    borderRadius: "16px",
                    padding: "10px 18px",
                    boxShadow: "none",
                    width: "fit-content",
                    "&:hover": { backgroundColor: "#e8eaed", boxShadow: "none" },
                  }}
                >
                  {question}
                </Button>
              ))}
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1, py: 1 }}>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                blocks={msg.blocks}
                isLoading={false}
              />
            ))}
            {isLoading && (
              <ChatMessage role="assistant" blocks={[]} isLoading />
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ p: 2, flexShrink: 0 }}>
        <Paper
          elevation={0}
          sx={{
            p: "12px 16px",
            display: "flex",
            flexDirection: "column",
            minHeight: 100,
            border: "1px solid #dadce0",
            borderRadius: "12px",
            transition: "border-color 0.2s",
            "&:focus-within": {
              borderColor: "var(--primary-btncolor-start)",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            },
          }}
        >
          <InputBase
            placeholder="Ask Optigo AI"
            fullWidth
            multiline
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            sx={{ fontSize: 15, flex: 1, alignItems: "flex-start" }}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <Tooltip title="Send message">
              <IconButton
                onClick={() => handleSend()}
                size="small"
                disabled={isLoading || !inputValue.trim()}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: inputValue.trim() && !isLoading ? "var(--primary-btncolor)" : "#edf0f5",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    background: inputValue.trim() && !isLoading ? "var(--primary-btncolor)" : "#e8eaed",
                  },
                }}
              >
                <Box
                  component="img"
                  src="./icons/ai-icon.svg"
                  alt="Send to Optigo AI"
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    opacity: inputValue.trim() && !isLoading ? 1 : 0.6,
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
