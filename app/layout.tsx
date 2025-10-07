import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import "./globals.css";
import Header from "./components/Header";
import { UserProvider } from "./contexts/UserContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <NextThemesProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <Header/>
          {children}
          </UserProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}