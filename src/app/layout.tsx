import { ReactNode } from "react";
import { SnackbarProvider } from "@/components/Snackbar";
import "./globals.css";

export const metadata = {
  title: "Matlogg",
  description: "Scan, build and share recipes from your phone",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SnackbarProvider>{children}</SnackbarProvider>
      </body>
    </html>
  );
}
