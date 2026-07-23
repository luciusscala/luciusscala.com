import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Kick off the background image fetch as early as possible so the
            full-load gate in app/page.tsx resolves quickly. */}
        <link rel="preload" as="image" href="/abstract.jpg" />
      </head>
      <body className="select-none bg-[#0025ce]">
        {children}
      </body>
    </html>
    );
  }


  