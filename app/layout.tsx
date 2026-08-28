import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SecLens — Security Intelligence, Visualized.",
  description: "Cybersecurity analytics and vulnerability management platform for security tools.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080c14] text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
