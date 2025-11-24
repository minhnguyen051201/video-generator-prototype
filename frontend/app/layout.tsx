import "../globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

// Components
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

// Load fonts with subsets and weights
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "AI Video Generator Platform",
  description:
    "Create cinematic stories with AI-powered camera control, consistent styling, and collaborative workflows.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} w-full h-full`}
    >
      <body className="flex min-h-screen flex-col bg-background text-[#F2E5D7] items-center">
        <Header />
        <main className="h-full w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
