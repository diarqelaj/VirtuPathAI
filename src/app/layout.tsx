import { Inter } from "next/font/google";
import { ThemeProvider } from "./provider";
import Chatbot from "@/components/chatbot"; // 👈 Import it
import './globals.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VirtuPath AI",
  description: "Your personal AI assistant for daily tasks and training.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/jsm-logo.png" sizes="any" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Chatbot /> {/* 👈 Add this at the end */}
        </ThemeProvider>
      </body>
    </html>
  );
}
