import React from "react";
import { Box, Typography, Tooltip, Zoom, Checkbox } from "@mui/material";
import ScaleOutlinedIcon from "@mui/icons-material/ScaleOutlined";
import AssignmentReturnOutlinedIcon from "@mui/icons-material/AssignmentReturnOutlined";
import TrendingDownOutlinedIcon from "@mui/icons-material/TrendingDownOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';

// Neutral palette with translucent background & subtle borders for glassmorphism
const CHIP_PALETTE = [
  { bg: "rgba(238, 242, 255, 0.55)", text: "#4338ca", border: "rgba(199, 210, 254, 0.65)" }, // indigo
  { bg: "rgba(239, 246, 255, 0.55)", text: "#1d4ed8", border: "rgba(191, 219, 254, 0.65)" }, // blue
  { bg: "rgba(245, 243, 255, 0.55)", text: "#6d28d9", border: "rgba(221, 214, 254, 0.65)" }, // violet
  { bg: "rgba(240, 249, 255, 0.55)", text: "#0369a1", border: "rgba(186, 230, 253, 0.65)" }, // sky
  { bg: "rgba(248, 250, 252, 0.55)", text: "#475569", border: "rgba(226, 232, 240, 0.65)" }, // slate
  { bg: "rgba(250, 245, 255, 0.55)", text: "#7c3aed", border: "rgba(233, 213, 255, 0.65)" }, // purple
  { bg: "rgba(236, 254, 255, 0.55)", text: "#0e7490", border: "rgba(165, 243, 252, 0.65)" }, // cyan
  { bg: "rgba(241, 245, 249, 0.55)", text: "#334155", border: "rgba(203, 213, 225, 0.65)" }, // blue-gray
];

// Helper to provide vector MUI icons for clean tooltips (no emojis)
const getMetricIcon = (key, color) => {
  const normalized = String(key).toLowerCase();
  const iconProps = { sx: { fontSize: 16, color: color || "#4f46e5" } };
  if (normalized.includes("issue")) return <ScaleOutlinedIcon {...iconProps} />;
  if (normalized.includes("return")) return <AssignmentReturnOutlinedIcon {...iconProps} />;
  if (normalized.includes("pure")) return <AutoAwesomeOutlinedIcon {...iconProps} />;
  if (normalized.includes("loss")) return <TrendingDownOutlinedIcon {...iconProps} />;
  return <AnalyticsOutlinedIcon {...iconProps} />;
};

const getMetricDescription = (key, label) => {
  const normalized = String(key).toLowerCase();
  if (normalized.includes("issue")) return `Total issue weight registered for ${label}.`;
  if (normalized.includes("return")) return `Total return weight logged for ${label}.`;
  if (normalized.includes("pure")) return `Pure fine metal loss calculated for ${label}.`;
  if (normalized.includes("loss")) return `Total weight loss recorded for ${label}.`;
  return `Summary metric for ${label}.`;
};

const PanelCard = ({ label, selected, onClick, summary = {} }) => {
  const summaryEntries = Object.entries(summary);
  const hasSummary = summaryEntries.length > 0;

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: "pointer",
        borderRadius: "4px",
        px: "8px",
        pt: "8px",
        pb: "8px",
        position: "relative",
        userSelect: "none",
        background: selected ? "#f0eeffe1" : "#ffffff",
        border: "1px solid",
        borderLeft:selected ? "4px solid" : "",
        borderBottom:selected ? "4px solid" : "",
        borderColor: selected ? "rgba(109,90,229,0.3)" : "rgba(0,0,0,0.09)",
        boxShadow: selected
          ? "0 2px 8px rgba(109,90,229,0.13)"
          : "0 1px 3px rgba(0,0,0,0.06)",
        "&:hover": {
          borderColor: selected ? "rgba(109,90,229,0.42)" : "rgba(0,0,0,0.16)",
          boxShadow: selected
            ? "0 2px 10px rgba(109,90,229,0.18)"
            : "0 2px 8px rgba(0,0,0,0.08)",
        },
      
      }}
    >
      {/* Top Header Row: Name & Right Checkbox */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "6px",
          pl: "4px",
          mb: hasSummary ? "6px" : 0,
        }}
      >
        <Typography
          sx={{
            fontSize: "0.775rem",
            fontWeight: selected ? 600 : 500,
            color: selected ? "#3d2e9e" : "#1f2937",
            lineHeight: 1.35,
            letterSpacing: "0.008em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
            minWidth: 0,
          }}
          title={label}
        >
          {label}
        </Typography>

        <Checkbox
          checked={!!selected}
          size="small"
          icon={<RadioButtonUncheckedRoundedIcon sx={{ fontSize: "1.1rem" }} />}
          checkedIcon={<RadioButtonCheckedRoundedIcon sx={{ fontSize: "1.1rem" }} />}
          onClick={(e) => {
            e.stopPropagation();
            if (onClick) onClick(e);
          }}
          sx={{
            p: 0,
            color: "rgba(156, 163, 175, 0.5)",
            "&.Mui-checked": {
              color: "#7c6cf0",
            },
          }}
        />
      </Box>

      {/* Stat chips — horizontal inline with glass edge effect & clean white tooltips */}
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
              <Tooltip
                key={k}
                title={
                  <Box sx={{ p: 0.8, maxWidth: 210 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                      {getMetricIcon(k, p.text)}
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "#1e293b",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {k}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: "0.92rem",
                        fontWeight: 700,
                        color: p.text,
                        mb: 0.5,
                        lineHeight: 1.2,
                      }}
                    >
                      {v}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.69rem",
                        color: "#475569",
                        lineHeight: 1.35,
                        fontWeight: 400,
                      }}
                    >
                      {getMetricDescription(k, label)}
                    </Typography>
                  </Box>
                }
                arrow
                placement="top"
                TransitionComponent={Zoom}
                enterDelay={120}
                leaveDelay={50}
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, 4],
                        },
                      },
                    ],
                  },
                  tooltip: {
                    sx: {
                      bgcolor: "#ffffff",
                      color: "#1e293b",
                      borderRadius: "10px",
                      px: 1,
                      py: 0.75,
                      boxShadow: "0 10px 30px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                    },
                  },
                  arrow: {
                    sx: {
                      color: "#ffffff",
                      "&::before": {
                        border: "1px solid rgba(0, 0, 0, 0.08)",
                      },
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    px: "8px",
                    py: "2.5px",
                    borderRadius: "3px",
                    backgroundColor: p.bg,
                    border: `1px solid ${p.border}`,
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.85)",
                    lineHeight: 1,
                    transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    borderRight: `4px solid ${p.border}`,
                    cursor: "pointer",
                    "&:hover": {
                      transform: "translateY(-1.5px) scale(1.04)",
                      boxShadow: `0 4px 10px ${p.border}, inset 0 1px 0 rgba(255,255,255,0.95)`,
                      backgroundColor: p.bg.replace("0.55", "0.8"),
                    },
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "0.71rem",
                      fontWeight: 440,
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
                      fontWeight: 740,
                      color: p.text,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {v}
                  </Typography>
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default PanelCard;



