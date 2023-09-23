import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Dump Tech",
  description: "Dump all your friend.tech keys",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const projectId = process.env.WALLETCONNECT_PROJECT_ID ?? "";
  return (
    <html lang="en">
      <body>
        <Providers projectId={projectId}>{children}</Providers>
      </body>
    </html>
  );
}
