import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fireflies.ai Clone",
  description: "AI Meeting Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[var(--color-bg-main)] text-[var(--color-text-primary)] antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <ReactQueryProvider>
            <div className="flex h-screen w-full overflow-hidden">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main Layout Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
              <Header />
              
              <main className="flex-1 overflow-hidden relative flex flex-col">
                {children}
              </main>
            </div>
            </div>
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
