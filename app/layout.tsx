import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import NetworkChecker from "@/components/wallet/NetworkChecker";
import DevModeBanner from "@/components/wallet/DevModeBanner";

export const metadata: Metadata = {
  title: "PayForMe - Income-Backed Pay-Fi Credit",
  description: "Pay-Fi credit protocol with income-backed, under-collateralized credit using onchain transaction analysis and AI agent management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: 'dark' }}>
      <body className="antialiased">
        <NetworkChecker />
        <DevModeBanner />
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 lg:ml-64">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
