"use client";

import { RecoilRoot } from "recoil";
import { DeviceStatusProvider } from "@/Components/DeviceStatusContext/DeviceStatusContext";
import { getClientIpAddress } from "@/Utils/globalFunc";
import { useEffect } from "react";
import Script from "next/script";
import "./globals.scss";

export default function RootLayout({ children }) {

  useEffect(() => {
    getClientIpAddress();
  }, []);

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Poppins:ital,wght@0,100..900&display=swap"
          rel="stylesheet"
        />
        <Script
          src="https://code.jquery.com/jquery-1.7.2.min.js"
          strategy="beforeInteractive"
        />
        <Script id="jquery-global" strategy="beforeInteractive">
          {`
            window.$ = window.jQuery;
          `}
        </Script>
        <Script id="safe-parent" strategy="beforeInteractive">
          {`
            try {
              if (window.parent && window.parent.$) {
                window.$ = window.parent.$;
              }
            } catch(e) {
              console.warn("Cross-origin blocked, using local jQuery");
            }
          `}
        </Script>
        <Script
          src="/js/flexigrid_advance.js"
          strategy="afterInteractive"
        />

      </head>

      <body>
        <RecoilRoot>
          <DeviceStatusProvider>
            {children}
          </DeviceStatusProvider>
        </RecoilRoot>
      </body>
    </html>
  );
}