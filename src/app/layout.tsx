import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GKP Finance - Sistema de Controle Financeiro",
  description: "Sistema robusto de controle financeiro em tempo real para empresas de marketing digital",
  keywords: ["GKP Finance", "Controle Financeiro", "Marketing Digital", "Gestão Financeira"],
  authors: [{ name: "GKP Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "GKP Finance",
    description: "Sistema de controle financeiro em tempo real para marketing digital",
    url: "https://chat.z.ai",
    siteName: "GKP Finance",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GKP Finance",
    description: "Sistema de controle financeiro em tempo real para marketing digital",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
