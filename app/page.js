// app/page.js
"use client";

import { Suspense, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import RouterContent from "@/Components/RouterContent";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            height: "100vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </div>
      }
    >
      <RouterContent />
    </Suspense>
  );
}

// metal loss summury
// find . -mindepth 1 -delete

// Dxreport - beta - 6006 - 34
// npm run build && pm2 restart 34 && pm2 save 

// Dxreport - live - 6010  - 30  
// npm run build && pm2 restart 30 && pm2 save 


// Dxreport - local77 - 6011  - 31
// R76 - 5008

// R76BETA - 5009
// R76LIVE - 5012

// R77BETA - 5015