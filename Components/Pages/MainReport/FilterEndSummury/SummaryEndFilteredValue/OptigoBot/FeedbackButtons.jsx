import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { ThumbsUp, ThumbsDown, Check, X, MessageSquare } from "lucide-react";
import submitFeedback from "@/API/LLMApi/optigoFeedback";

// Reason chips shown in the feedback dialog.
const DOWNVOTE_REASONS = [
  { id: "inaccurate", label: "Inaccurate" },
  { id: "unhelpful", label: "Unhelpful" },
  { id: "too_long", label: "Too Long" },
  { id: "incomplete", label: "Incomplete" },
  { id: "other", label: "Other" },
];

export default function FeedbackButtons({
  sessionId,
  question,
  answer,
  reportKey,
  metric,
}) {
  const theme = useTheme();
  const [vote, setVote] = useState(null); // "up" | "down" | null
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [comment, setComment] = useState("");

  const handleSubmit = async (rating, reason, commentText) => {
    const fullComment = reason
      ? `[${reason}]${commentText ? ` ${commentText}` : ""}`
      : commentText || "";
    await submitFeedback({
      session_id: sessionId,
      question,
      answer,
      report_key: reportKey,
      metric,
      rating,
      comment: fullComment,
    });
  };

  const handleThumbsUp = () => {
    setVote("up");
    handleSubmit("up");
  };

  const handleThumbsDown = () => {
    setVote("down");
    setDialogOpen(true);
  };

  const handleReasonSelect = (reasonId) => {
    setSelectedReason(selectedReason === reasonId ? null : reasonId);
  };

  const handleSubmitDownvote = () => {
    const reasonLabel = DOWNVOTE_REASONS.find((r) => r.id === selectedReason)?.label;
    handleSubmit("down", reasonLabel, comment);
    setDialogOpen(false);
    setSelectedReason(null);
    setComment("");
  };

  const handleCancelDownvote = () => {
    setDialogOpen(false);
    setSelectedReason(null);
    setComment("");
    setVote(null);
  };

  // --- Icon row stays visible after voting; the chosen thumb is filled. ---
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Tooltip title="Good response">
          <IconButton
            onClick={handleThumbsUp}
            sx={{
              color: vote === "up" ? "success.main" : "text.disabled",
              padding: "6px",
              borderRadius: "16px",
              transition: "all 0.15s ease",
              "&:hover": {
                color: "success.main",
                backgroundColor: alpha(theme.palette.success.main, 0.08),
              },
            }}
          >
            <ThumbsUp size={15} strokeWidth={2} fill={vote === "up" ? theme.palette.success.main : "none"} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Bad response">
          <IconButton
            onClick={handleThumbsDown}
            sx={{
              color: vote === "down" ? "error.main" : "text.disabled",
              padding: "6px",
              borderRadius: "16px",
              transition: "all 0.15s ease",
              "&:hover": {
                color: "error.main",
                backgroundColor: alpha(theme.palette.error.main, 0.08),
              },
            }}
          >
            <ThumbsDown size={15} strokeWidth={2} fill={vote === "down" ? theme.palette.error.main : "none"} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Feedback Dialog — like ChatGPT */}
      <Dialog
        open={dialogOpen}
        onClose={handleCancelDownvote}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: "16px", overflow: "hidden" },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            pb: 1,
            fontSize: 16,
            fontWeight: 600,
            color: "text.primary",
            borderBottom: "1px solid", borderBottomColor: "grey.100",
          }}
        >
          <MessageSquare size={18} color={theme.palette.error.main} />
          Share Feedback
          <IconButton
            onClick={handleCancelDownvote}
            size="small"
            sx={{ ml: "auto", color: "text.disabled" }}
          >
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 2.5 }}>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 1.5 }}>
            What was wrong with this response?
          </Typography>

          {/* Reason chips */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
            {DOWNVOTE_REASONS.map((reason) => (
              <Chip
                key={reason.id}
                label={reason.label}
                onClick={() => handleReasonSelect(reason.id)}
                sx={{
                  fontSize: 12.5,
                  height: 30,
                  cursor: "pointer",
                  borderRadius: "16px",
                  backgroundColor:
                    selectedReason === reason.id
                      ? alpha(theme.palette.error.main, 0.08)
                      : "grey.50",
                  color: selectedReason === reason.id ? "error.main" : "text.secondary",
                  border: "1px solid",
                  borderColor:
                    selectedReason === reason.id ? "error.light" : "divider",
                  fontWeight: selectedReason === reason.id ? 600 : 400,
                  "&:hover": {
                    backgroundColor:
                      selectedReason === reason.id
                        ? alpha(theme.palette.error.main, 0.14)
                        : "grey.100",
                  },
                }}
              />
            ))}
          </Box>

          {/* Comment field */}
          <Paper
            elevation={0}
            sx={{
              border: "1px solid", borderColor: "divider",
              borderRadius: "16px",
              px: 1.5,
              py: 0.5,
              mb: 2,
              "&:focus-within": {
                borderColor: "error.main",
              },
            }}
          >
            <InputBase
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add more detail (optional)"
              multiline
              minRows={2}
              maxRows={4}
              sx={{ fontSize: 13, color: "text.primary", width: "100%" }}
            />
          </Paper>

          {/* Privacy note */}
          <Typography
            sx={{
              fontSize: 11,
              color: "text.disabled",
              fontStyle: "italic",
              mb: 2,
            }}
          >
            Feedback is used to improve responses. It is not linked to your account.
          </Typography>

          {/* Action buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Button
              onClick={handleCancelDownvote}
              sx={{
                textTransform: "none",
                color: "text.secondary",
                fontSize: 13,
                borderRadius: "16px",
                "&:hover": { backgroundColor: "grey.50" },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitDownvote}
              disabled={!selectedReason}
              startIcon={<Check size={16} />}
              sx={{
                textTransform: "none",
                fontSize: 13,
                borderRadius: "16px",
                backgroundColor: "error.main",
                boxShadow: "none",
                "&:hover": { backgroundColor: "error.dark", boxShadow: "none" },
                "&.Mui-disabled": {
                  backgroundColor: "error.light",
                  color: "common.white",
                },
              }}
            >
              Submit Feedback
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
