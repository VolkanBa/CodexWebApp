import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Persönliche Website",
  description: "Persönliche Website mit geschäftlichem und privatem Bereich."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
