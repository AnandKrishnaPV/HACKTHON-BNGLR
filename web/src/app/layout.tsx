import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Q-Swarm | Quantum Logistics Optimization",
  description: "Autonomous quantum logistics routing and x402 machine-to-machine payments on Algorand.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`h-full antialiased font-sans`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
