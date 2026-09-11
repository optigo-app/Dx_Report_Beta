import React, { useRef, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  Paper,
} from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

// Register chart.js components once at module load (project pattern).
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const CHART_COLORS = [
  "#6366F1", "#10B981", "#F43F5E", "#F59E0B", "#3B82F6",
  "#8B5CF6", "#06B6D4", "#84CC16", "#EC4899", "#A855F7",
];

// Title-case a string: "sungs jinwoo" -> "Sungs Jinwoo".
// Preserves short words like "of", "the" lowercase unless they're first.
const TITLE_SMALL_WORDS = new Set(["of", "the", "and", "or", "a", "an", "to", "in", "on", "at", "by", "for"]);
const titleCase = (str) => {
  if (str == null) return str;
  const s = String(str).trim();
  if (!s) return s;
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((word, i) => {
      if (i !== 0 && TITLE_SMALL_WORDS.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

// Heuristic: does this cell value look like a person/entity name?
// Used to apply title-casing only to name-like strings, not numbers/dates/amounts.
const isNameLike = (value) => {
  if (value == null) return false;
  const s = String(value).trim();
  if (!s || s.length < 2) return false;
  // Reject anything with digits, currency, or percent signs.
  if (/[0-9₹$%]/.test(s)) return false;
  // Must contain at least one letter and be mostly alphabetic (allow spaces, hyphens, apostrophes).
  if (!/[A-Za-z]/.test(s)) return false;
  return /^[A-Za-z][A-Za-z\s'-]*$/.test(s);
};

// Heuristic: does this cell value look like a number/currency/amount?
// Matches: "1234", "1,234.56", "₹1000", "$500", "1000.50", "12,34,567.89"
const isNumericLike = (value) => {
  if (value == null) return false;
  const s = String(value).trim();
  if (!s) return false;
  // Strip currency symbols and spaces, then test the rest is digits/commas/dots.
  const stripped = s.replace(/[₹$\s]/g, "").replace(/[,]/g, "");
  return stripped !== "" && !isNaN(Number(stripped)) && /^[+-]?[\d.]+$/.test(stripped);
};

// Parse a numeric-like string into a Number (handles ₹, $, commas).
const parseNumeric = (value) => {
  if (value == null) return NaN;
  const s = String(value).trim().replace(/[₹$\s,]/g, "");
  return Number(s);
};

// Indian currency formatter: 3157737402.74 -> "₹3,15,77,37,402.74"
const indianCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

// Format a numeric value as Indian rupee currency.
const formatCurrency = (value) => {
  const n = typeof value === "number" ? value : parseNumeric(value);
  if (isNaN(n)) return value;
  return indianCurrencyFormatter.format(n);
};

// Column headers that indicate a money/amount column (case-insensitive).
// Only these columns get ₹ currency formatting; rank/serial/qty columns stay plain.
const MONEY_COLUMN_KEYWORDS = [
  "revenue", "amount", "sales", "price", "cost", "total",
  "value", "payment", "balance", "discount", "tax", "profit",
  "loss", "expense", "income", "turnover", "bill", "deposit",
];

// Check if a column header suggests a money column.
const isMoneyColumn = (columnName) => {
  if (!columnName) return false;
  const lower = String(columnName).toLowerCase();
  return MONEY_COLUMN_KEYWORDS.some((kw) => lower.includes(kw));
};

// Format a cell value with optional column context:
// - title-case names
// - format as ₹ currency ONLY if the column is a money column
// - else return as-is (rank, qty, etc. stay plain)
const formatCell = (value, columnName) => {
  if (isNameLike(value)) return titleCase(value);
  if (isNumericLike(value) && isMoneyColumn(columnName)) return formatCurrency(value);
  return value;
};

// Compact number formatter for Y-axis ticks (Indian numbering: K, L, Cr).
// 1500 -> "1.5K", 100000 -> "1L", 10000000 -> "1Cr".
const formatCompactNumber = (n) => {
  if (n == null || isNaN(n)) return "";
  const abs = Math.abs(n);
  if (abs >= 1e7) return `${(n / 1e7).toFixed(abs >= 1e8 ? 0 : 1)}Cr`;
  if (abs >= 1e5) return `${(n / 1e5).toFixed(abs >= 1e6 ? 0 : 1)}L`;
  if (abs >= 1e3) return `${(n / 1e3).toFixed(abs >= 1e4 ? 0 : 1)}K`;
  return String(n);
};

function TextBlock({ content }) {
  // Source/citation lines (e.g. "Sources: Sales Report") render as a
  // smaller, brighter footer-style note instead of full body text.
  const isSourceLine = /^sources?\s*:/i.test(String(content).trim());

  if (isSourceLine) {
    return (
      <Typography
        component="p"
        sx={{
          fontSize: 11,
          lineHeight: 1.4,
          color: "#94a3b8",
          mt: 1,
          pt: 0.75,
          borderTop: "1px solid #f1f5f9",
          fontStyle: "italic",
        }}
      >
        {content}
      </Typography>
    );
  }

  return (
    <Typography
      component="p"
      sx={{
        fontSize: 14,
        lineHeight: 1.5,
        color: "#334155",
        my: 0.5,
        whiteSpace: "pre-line",
      }}
    >
      {content}
    </Typography>
  );
}

// Column headers that indicate a rank/serial/number column (left-aligned).
const RANK_COLUMN_KEYWORDS = ["rank", "sr", "srno", "serial", "no", "no.", "s.no", "s.no.", "#"];

// Check if a column header suggests a rank/serial column.
const isRankColumn = (columnName) => {
  if (!columnName) return false;
  const lower = String(columnName).toLowerCase().trim();
  return RANK_COLUMN_KEYWORDS.some((kw) => lower === kw || lower.startsWith(kw));
};

function TableBlock({ columns, rows }) {
  if (!Array.isArray(columns) || !Array.isArray(rows)) return null;

  // Detect which columns are numeric (rank, revenue, etc.) vs text (names).
  const colIsNumeric = columns.map((_, ci) =>
    rows.every((row) => isNumericLike(row[ci]))
  );
  // Right-align only money columns; rank/serial columns stay left-aligned.
  const colAlignRight = columns.map((col) => isMoneyColumn(col) && !isRankColumn(col));

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        my: 1,
        border: "1px solid #eef2f7",
        borderRadius: 1.5,
        overflow: "hidden",
        width: "100%",
        backgroundColor: "#fbfcfe",
        "& .MuiTable-root": {
          width: "100%",
          tableLayout: "auto",
        },
        "& .MuiTableCell-root": {
          fontFamily: "var(--font-poppins), 'Poppins', sans-serif",
          py: 0.75,
          px: 1.25,
          fontSize: 13,
        },
      }}
    >
      <Table size="small">
        <TableHead sx={{ backgroundColor: "#f4f7fb" }}>
          <TableRow>
            {columns.map((col, i) => (
              <TableCell
                key={i}
                sx={{
                  fontWeight: 600,
                  color: "#64748b",
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid #e2e8f0",
                  // Money columns right-aligned + narrow; others left.
                  textAlign: colAlignRight[i] ? "right" : "left",
                  width: colIsNumeric[i] ? "1%" : "auto",
                  whiteSpace: colIsNumeric[i] ? "nowrap" : "normal",
                }}
              >
                {col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, ri) => (
            <TableRow
              key={ri}
              sx={{
                backgroundColor: ri % 2 === 0 ? "#fff" : "#f8fafc",
                "&:hover": { backgroundColor: "#f1f5f9" },
              }}
            >
              {row.map((cell, ci) => {
                const colName = columns[ci];
                const isNumeric = colIsNumeric[ci];
                const alignRight = colAlignRight[ci];
                return (
                  <TableCell
                    key={ci}
                    sx={{
                      color: "#1e293b",
                      whiteSpace: isNumeric ? "nowrap" : "normal",
                      wordBreak: isNumeric ? "keep-all" : "break-word",
                      textAlign: alignRight ? "right" : "left",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    {formatCell(cell, colName)}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ListBlock({ style, items }) {
  if (!Array.isArray(items)) return null;
  const isNumbered = style === "number";
  return (
    <List dense sx={{ my: 1, ml: 2, listStyleType: isNumbered ? "decimal" : "disc", pl: 1 }}>
      {items.map((item, i) => (
        <ListItem
          key={i}
          sx={{
            display: "list-item",
            pl: 0,
            py: 0.25,
            color: "#1f2937",
            fontSize: 15,
            lineHeight: 1.5,
            "&::marker": isNumbered ? undefined : { color: "#6400b8" },
          }}
        >
          <ListItemText primary={item} />
        </ListItem>
      ))}
    </List>
  );
}

// Chart.js tooltip style — shared across all chart types.
// Uses chart.js's supported options only; boxShadow isn't a native
// chart.js tooltip option, so we use displayColors + callbacks instead.
const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#ffffff",
  titleColor: "#0f172a",
  bodyColor: "#1f2937",
  borderColor: "#e2e8f0",
  borderWidth: 1,
  cornerRadius: 8,
  padding: 12,
  displayColors: true,
  boxPadding: 6,
  usePointStyle: true,
  titleFont: { size: 13, weight: "600", family: "'Poppins', sans-serif" },
  bodyFont: { size: 13, family: "'Poppins', sans-serif" },
  caretSize: 6,
};

// Shared legend style.
const CHART_LEGEND_STYLE = {
  position: "bottom",
  labels: {
    font: { size: 12, family: "'Poppins', sans-serif" },
    padding: 12,
    usePointStyle: true,
    pointStyle: "circle",
  },
};

function ChartBlock({ chart_type, x_key, series }) {
  // Hooks must be called before any early return (rules-of-hooks).
  const chartRef = useRef(null);
  const [hiddenSlices, setHiddenSlices] = useState({});

  if (!Array.isArray(series) || !series.length) return null;

  // Pivot series into rows keyed by x_key, then extract labels + datasets.
  const rowsMap = {};
  series.forEach((s) => {
    (s.data || []).forEach((point) => {
      if (!rowsMap[point.x]) rowsMap[point.x] = { [x_key]: point.x };
      rowsMap[point.x][s.name] = point.y;
    });
  });
  const chartData = Object.values(rowsMap);
  const pointCount = chartData.length;

  // Compute total for pie chart percentage display.
  const totalValue = chartData.reduce(
    (sum, d) => sum + (series[0] ? Math.abs(d[series[0].name] ?? 0) : 0),
    0
  );

  // ── Pie: show all slices as returned by the API ───────────────────────
  // No "Others" grouping — the API already returns the exact items the
  // user wants to see. Small slices are made legible via the interactive
  // custom legend (click a dominant slice to hide it and re-scale).
  let pieLabels = [];
  let pieValues = [];
  let pieColors = [];

  if (chart_type === "pie") {
    const valueKey = series[0]?.name;
    const items = chartData
      .map((d, i) => ({
        label: isNameLike(String(d[x_key] ?? "")) ? titleCase(String(d[x_key])) : String(d[x_key] ?? ""),
        value: Math.abs(d[valueKey] ?? 0),
        color: CHART_COLORS[i % CHART_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    pieLabels = items.map((it) => it.label);
    pieValues = items.map((it) => it.value);
    pieColors = items.map((it) => it.color);
  }

  // ── Bar/Line: build labels + datasets as before ───────────────────────
  const barLineLabels = chartData.map((d) => {
    const raw = String(d[x_key] ?? "");
    return isNameLike(raw) ? titleCase(raw) : raw;
  });

  // Detect non-numeric x-axis values → use horizontal bar so category
  // labels (product names, metal types) show fully on the y-axis without
  // rotation/overlap. "0 Product Type" is non-numeric despite starting
  // with a digit, so we check isNumericLike rather than isNameLike.
  const xValuesAreCategories =
    chartData.length > 0 &&
    chartData.every((d) => !isNumericLike(String(d[x_key] ?? "")));
  const useHorizontalBar = chart_type === "bar" && xValuesAreCategories;

  // Build chart.js datasets.
  let datasets;
  if (chart_type === "pie") {
    datasets = [
      {
        label: series[0]?.name || "Value",
        data: pieValues,
        backgroundColor: pieColors,
        borderColor: "#fff",
        borderWidth: 2,
      },
    ];
  } else {
    datasets = series.map((s, i) => {
      const color = CHART_COLORS[i % CHART_COLORS.length];
      const values = chartData.map((d) => d[s.name] ?? 0);

      if (chart_type === "bar") {
        return {
          label: s.name,
          data: values,
          backgroundColor: color,
          borderColor: color,
          borderRadius: 6,
          maxBarThickness: 60,
        };
      }
      // line
      return {
        label: s.name,
        data: values,
        borderColor: color,
        backgroundColor: color + "20",
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: color,
      };
    });
  }

  // Dynamic height: more points need more room. Horizontal bars need more
  // vertical space per bar so names don't squeeze. Vertical bars need more
  // height so bars + axis labels don't crowd.
  const chartHeight =
    chart_type === "pie"
      ? 320
      : useHorizontalBar
        ? Math.max(320, pointCount * 56)
        : Math.max(340, pointCount * 60);

  // Shared options for bar/line charts.
  const cartesianOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: useHorizontalBar ? "y" : "x",
    // Layout padding: left for Y-axis labels, bottom for rotated X-axis labels.
    layout: {
      padding: {
        left: useHorizontalBar ? 0 : 8,
        right: 8,
        top: 8,
        bottom: useHorizontalBar ? 8 : 40,
      },
    },
    plugins: {
      legend: CHART_LEGEND_STYLE,
      tooltip: {
        ...CHART_TOOLTIP_STYLE,
        callbacks: {
          title: (items) => {
            if (!items?.length) return "";
            return String(items[0].label ?? "");
          },
          label: (ctx) => {
            const label = ctx.dataset.label || "";
            const value = ctx.parsed[useHorizontalBar ? "x" : "y"];
            return `${label}: ${formatCurrency(value)}`;
          },
        },
      },
    },
    scales: {
      x: {
        // Vertical bars: x is the CATEGORY axis (product names) → always
        // "category". Horizontal bars: x is the VALUE axis → always linear
        // (log scale creates confusing axis labels).
        type: useHorizontalBar ? "linear" : "category",
        ticks: {
          font: { size: 11, family: "'Poppins', sans-serif" },
          color: "#475569",
          // Vertical bars: allow up to 45° rotation for long names, auto-skip
          // to prevent overlap. Horizontal bars: format + auto-skip values.
          ...(useHorizontalBar
            ? { callback: (v) => formatCompactNumber(v), autoSkip: true, maxTicksLimit: 6 }
            : { maxRotation: 45, minRotation: 0, autoSkip: true, maxTicksLimit: 8 }),
        },
        grid: { color: "#e2e8f0", drawBorder: false },
      },
      y: {
        // Always linear — log scale creates confusing power-of-10 labels.
        // Small bars stay small but accurate; values visible in tooltip.
        type: useHorizontalBar ? "category" : "linear",
        ticks: {
          font: { size: 11, family: "'Poppins', sans-serif" },
          color: "#475569",
          autoSkip: true,
          maxTicksLimit: 6,
          ...(useHorizontalBar
            ? { autoSkip: false }
            : { callback: (v) => formatCompactNumber(v) }),
        },
        grid: { color: "#e2e8f0", drawBorder: false },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      // Disable Chart.js's built-in legend — we render a custom one below.
      legend: { display: false },
      tooltip: {
        ...CHART_TOOLTIP_STYLE,
        callbacks: {
          title: (items) => {
            if (!items?.length) return "";
            return String(items[0].label ?? "");
          },
          label: (ctx) => {
            const label = ctx.label || "";
            const value = ctx.parsed;
            const pct = totalValue > 0 ? ((Math.abs(value) / totalValue) * 100).toFixed(2) : "0";
            return `${label}: ${formatCurrency(value)} (${pct}%)`;
          },
        },
      },
    },
  };

  const data = {
    labels: chart_type === "pie" ? pieLabels : barLineLabels,
    datasets:
      chart_type === "pie"
        ? [{ ...datasets[0], hoverOffset: 4 }]
        : datasets,
  };

  // ── Custom legend state for pie charts ───────────────────────────────
  // Tracks which slices are hidden. Clicking a legend item toggles it,
  // and Chart.js re-scales the visible slices to fill the doughnut.
  const toggleSlice = (idx) => {
    const chart = chartRef.current;
    if (!chart) return;
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.[idx]) return;
    // Toggle visibility on the chart's internal meta.
    meta.data[idx].hidden = !meta.data[idx].hidden;
    chart.update();
    // Mirror state to re-render the custom legend styling.
    setHiddenSlices((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const pieLegendItems =
    chart_type === "pie"
      ? pieLabels.map((label, i) => ({
          label,
          value: pieValues[i],
          color: pieColors[i],
          pct: totalValue > 0 ? ((pieValues[i] / totalValue) * 100).toFixed(2) : "0",
          hidden: !!hiddenSlices[i],
          index: i,
        }))
      : [];

  return (
    <Box
      sx={{
        my: 1,
        border: "1px solid #e2e8f0",
        borderRadius: 1.5,
        p: 1.5,
        width: "100%",
        // Pie: auto height so legend + chart both fit. Bar/line: fixed.
        height: chart_type === "pie" ? "auto" : chartHeight,
        overflow: "visible",
        backgroundColor: "#f8fafc",
        backgroundImage: "radial-gradient(circle at 20% 0%, #f1f5ff 0%, #f8fafc 60%)",
      }}
    >
      {chart_type === "pie" ? (
        <>
          {/* TOP: color boxes only — no text, no amount */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 1,
              mb: 1.5,
            }}
          >
            {pieLegendItems.map((item) => (
              <Box
                key={item.index}
                onClick={() => toggleSlice(item.index)}
                sx={{
                  width: "100%",
                  height: 28,
                  backgroundColor: item.color,
                  cursor: "pointer",
                  borderRadius: 1,
                  opacity: item.hidden ? 0.3 : 1,
                  transition: "all 0.15s ease",
                  boxShadow: item.hidden ? "none" : "0 1px 3px rgba(0,0,0,0.12)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 3px 8px rgba(0,0,0,0.18)",
                  },
                }}
              />
            ))}
          </Box>

          {/* MIDDLE: doughnut chart */}
          <Box sx={{ width: "100%", height: 260, position: "relative" }}>
            <Doughnut ref={chartRef} data={data} options={pieOptions} />
          </Box>

          {/* BOTTOM: metal name + amount row */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 1,
              mt: 1.5,
              pt: 1,
              borderTop: "1px solid #e2e8f0",
            }}
          >
            {pieLegendItems.map((item) => (
              <Box
                key={item.index}
                onClick={() => toggleSlice(item.index)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.25,
                  cursor: "pointer",
                  opacity: item.hidden ? 0.4 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#334155",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                    textDecoration: item.hidden ? "line-through" : "none",
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 9,
                    color: "#64748b",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: "100%",
                  }}
                >
                  {formatCompactNumber(item.value)}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      ) : chart_type === "bar" ? (
        <Box sx={{ width: "100%", height: chartHeight - 20, position: "relative" }}>
          <Bar data={data} options={cartesianOptions} />
        </Box>
      ) : (
        <Box sx={{ width: "100%", height: chartHeight - 20, position: "relative" }}>
          <Line data={data} options={cartesianOptions} />
        </Box>
      )}
    </Box>
  );
}

function AssumptionBlock({ content }) {
  return (
    <Box
      sx={{
        my: 1,
        px: 1.5,
        py: 1,
        backgroundColor: "#fffbeb",
        border: "1px solid #fde68a",
        borderRadius: 1,
        fontSize: 14,
        color: "#92400e",
      }}
    >
      <Box component="span" sx={{ fontWeight: 600 }}>Assumed:</Box> {content}
    </Box>
  );
}

function ErrorBlock({ content }) {
  return (
    <Box
      sx={{
        my: 1,
        px: 1.5,
        py: 1,
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: 1,
        fontSize: 14,
        color: "#b91c1c",
      }}
    >
      {content}
    </Box>
  );
}

function ClarifyBlock({ content }) {
  return (
    <Box
      sx={{
        my: 1,
        px: 1.5,
        py: 1.25,
        backgroundColor: "#eff6ff",
        border: "1px solid #bfdbfe",
        borderRadius: 1.5,
        fontSize: 14,
        lineHeight: 1.6,
        color: "#1e40af",
        display: "flex",
        gap: 1,
        alignItems: "flex-start",
      }}
    >
      <Box
        component="span"
        sx={{
          flexShrink: 0,
          width: 20,
          height: 20,
          borderRadius: "50%",
          backgroundColor: "#3b82f6",
          color: "#fff",
          fontSize: 12,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mt: 0.25,
        }}
      >
        ?
      </Box>
      <Box>
        <Box component="span" sx={{ fontWeight: 600 }}>Need more info: </Box>
        {content}
      </Box>
    </Box>
  );
}

const BLOCK_COMPONENTS = {
  text: TextBlock,
  table: TableBlock,
  list: ListBlock,
  chart: ChartBlock,
  assumption: AssumptionBlock,
  error: ErrorBlock,
  clarify: ClarifyBlock,
};

export default function ChatBlockRenderer({ blocks }) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return <ErrorBlock content="No response received." />;
  }

  return (
    <Box className="chat-message-content">
      {blocks.map((block, idx) => {
        const Component = BLOCK_COMPONENTS[block?.type];
        if (!Component) return null;
        try {
          return <Component key={idx} {...block} />;
        } catch {
          return <ErrorBlock key={idx} content="Couldn't render part of this response." />;
        }
      })}
    </Box>
  );
}
