import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import "./globals.css";
import Header from "./components/Header";
import { UserProvider } from "./contexts/UserContext";
import { VaultProvider } from "./contexts/VaultContext";
import { GeneratorProvider } from "./contexts/GeneratorContext";

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
            <VaultProvider>
              <GeneratorProvider>
                <Header/>
                {children}
              </GeneratorProvider>
            </VaultProvider>
          </UserProvider>
        </NextThemesProvider>
      </body>
    </html>
  );
}