import { Box, Paper } from "@mui/material";
import ChatBlockRenderer from "./ChatBlockRenderer";

function TypingIndicator() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 1.5 }}>
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: "#9ca3af",
            animation: "optigobot-bounce 1.4s infinite ease-in-out both",
            animationDelay: `${i * 0.16 - 0.32}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes optigobot-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </Box>
  );
}

export default function ChatMessage({ role, blocks, isLoading }) {
  const isBot = role === "assistant";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isBot ? "flex-start" : "flex-end",
        mb: 1.5,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: "100%",
          minWidth: 0,
          overflow: "hidden",
          px: 1.5,
          py: 1.25,
          borderRadius: isBot ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
          background: isBot ? "#ffffff" : "var(--primary-btncolor)",
          color: isBot ? "#1f2937" : "#ffffff",
          border: isBot ? "1px solid #eceff5" : "none",
          boxShadow: isBot
            ? "0 1px 3px rgba(15,23,42,0.06)"
            : "0 3px 10px rgba(100,0,184,0.18)",
          wordBreak: "break-word",
        }}
      >
        {isLoading ? (
          <TypingIndicator />
        ) : (
          <ChatBlockRenderer blocks={blocks} />
        )}
      </Paper>
    </Box>
  );
}
