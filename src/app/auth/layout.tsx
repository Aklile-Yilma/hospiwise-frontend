import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css"; // this imports base styles (optional)

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    console.log("AuthLayout rendered");
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <main style={{ minHeight: "100vh", width: "100%" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
