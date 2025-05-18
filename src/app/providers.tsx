// app/providers.tsx
'use client';

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./provider";
import Chatbot from "@/components/chatbot";
import FloatingChat from '@/components/FloatingChat';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
        <Chatbot />
        <FloatingChat />
      </ThemeProvider>
    </SessionProvider>
  );
}
