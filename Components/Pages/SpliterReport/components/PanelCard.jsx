import React from "react";
import { Box, Typography } from "@mui/material";

// Neutral palette with translucent background & subtle borders for glassmorphism
const CHIP_PALETTE = [
  { bg: "rgba(238, 242, 255, 0.75)", text: "#4338ca", border: "rgba(199, 210, 254, 0.65)" }, // indigo
  { bg: "rgba(239, 246, 255, 0.75)", text: "#1d4ed8", border: "rgba(191, 219, 254, 0.65)" }, // blue
  { bg: "rgba(245, 243, 255, 0.75)", text: "#6d28d9", border: "rgba(221, 214, 254, 0.65)" }, // violet
  { bg: "rgba(240, 249, 255, 0.75)", text: "#0369a1", border: "rgba(186, 230, 253, 0.65)" }, // sky
  { bg: "rgba(248, 250, 252, 0.75)", text: "#475569", border: "rgba(226, 232, 240, 0.65)" }, // slate
  { bg: "rgba(250, 245, 255, 0.75)", text: "#7c3aed", border: "rgba(233, 213, 255, 0.65)" }, // purple
  { bg: "rgba(236, 254, 255, 0.75)", text: "#0e7490", border: "rgba(165, 243, 252, 0.65)" }, // cyan
  { bg: "rgba(241, 245, 249, 0.75)", text: "#334155", border: "rgba(203, 213, 225, 0.65)" }, // blue-gray
];

const PanelCard = ({ label, selected, onClick, summary = {} }) => {
  const summaryEntries = Object.entries(summary);
  const hasSummary = summaryEntries.length > 0;

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: "pointer",
        borderRadius: "7px",
        px: "11px",
        pt: "8px",
        pb: hasSummary ? "8px" : "8px",
        position: "relative",
        userSelect: "none",
        background: selected ? "#f0eeff" : "#ffffff",
        border: "1px solid",
        borderColor: selected ? "rgba(109,90,229,0.3)" : "rgba(0,0,0,0.09)",
        boxShadow: selected
          ? "0 2px 8px rgba(109,90,229,0.13)"
          : "0 1px 3px rgba(0,0,0,0.06)",
        "&::before": {
          content: '""',
          position: "absolute",
          left: 0,
          top: "12%",
          height: "76%",
          width: "3px",
          borderRadius: "0 3px 3px 0",
          background: selected ? "#7c6cf0" : "transparent",
        },
        "&:hover": {
          borderColor: selected ? "rgba(109,90,229,0.42)" : "rgba(0,0,0,0.16)",
          boxShadow: selected
            ? "0 2px 10px rgba(109,90,229,0.18)"
            : "0 2px 8px rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* Name */}
      <Typography
        sx={{
          fontSize: "0.775rem",
          fontWeight: selected ? 600 : 500,
          color: selected ? "#3d2e9e" : "#1f2937",
          lineHeight: 1.35,
          letterSpacing: "0.008em",
          wordBreak: "break-word",
          pl: "4px",
          mb: hasSummary ? "6px" : 0,
        }}
      >
        {label}
      </Typography>

      {/* Stat chips — horizontal inline with glass edge effect */}
      {hasSummary && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
            pl: "4px",
          }}
        >
          {summaryEntries.map(([k, v], idx) => {
            const p = CHIP_PALETTE[idx % CHIP_PALETTE.length];
            return (
              <Box
                key={k}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  px: "8px",
                  py: "2.5px",
                  borderRadius: "999px",
                  backgroundColor: p.bg,
                  border: `1px solid ${p.border}`,
                  backdropFilter: "blur(6px)",
                  WebkitBackdropFilter: "blur(6px)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.85)",
                  lineHeight: 1,
                  transition: "all 0.15s ease",
                }}
              >
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.71rem",
                    fontWeight: 500,
                    color: p.text,
                    whiteSpace: "nowrap",
                    letterSpacing: "0.01em",
                  }}
                >
                  {k}
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: p.text,
                    whiteSpace: "nowrap",
                  }}
                >
                  {v}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default PanelCard;
