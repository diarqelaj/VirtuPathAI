// app/layout.tsx
import { Inter } from "next/font/google";
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VirtuPath AI",
  description: "Your personal AI assistant for daily tasks and training.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/virtupathai-favicon-192.png" type="image/png" sizes="192x192" />
        <link rel="preload" href="/footer-grid.svg" as="image" />
      </head>

      <body className={`${inter.className} overflow-x-hidden`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
