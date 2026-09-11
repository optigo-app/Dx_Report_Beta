const DEFAULT_COMPANY_CODE = "DEMO";
const DEFAULT_RESPONSE_MODE = "wide";
const REQUEST_TIMEOUT_MS = 30000;

const API_BASE =
  process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8001";

const sendChatMessage = async (req, signal) => {
  const body = {
    question: req.question,
    company_code: req.company_code || DEFAULT_COMPANY_CODE,
    user_id: req.user_id,
    session_id: req.session_id,
    response_mode: req.response_mode || DEFAULT_RESPONSE_MODE,
    filters: req.filters,
    export: req.export,
  };

  const timeoutCtrl = new AbortController();
  const timeoutId = setTimeout(() => timeoutCtrl.abort(), REQUEST_TIMEOUT_MS);

  let combinedSignal = timeoutCtrl.signal;
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      timeoutCtrl.abort();
    } else {
      signal.addEventListener("abort", () => timeoutCtrl.abort(), { once: true });
      combinedSignal = signal;
    }
  }

  try {
    const res = await fetch(`${API_BASE}/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: combinedSignal,
    });

    if (!res.ok) {
      throw new Error(`Chat API error: ${res.status}`);
    }

    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
};

export default sendChatMessage;
