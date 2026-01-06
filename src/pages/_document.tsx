import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Tiro+Devanagari+Hindi:ital@0;1&display=swap" 
          rel="stylesheet" 
        />
        <meta name="description" content="A beautiful AI-powered journaling application for reflection and personal growth" />
        <link rel="icon" href="/favicon.ico" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('journaling_theme');
                  if (!theme) theme = 'system';
                  var resolvedTheme = theme;
                  if (theme === 'system') {
                    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.setAttribute('data-theme', resolvedTheme);
                  document.documentElement.classList.add(resolvedTheme);
                  document.documentElement.style.backgroundColor = resolvedTheme === 'dark' ? '#13171e' : '#f8fafc';
                  
                  // Apply saved language
                  var lang = localStorage.getItem('journal_language');
                  if (lang === 'hi') {
                    document.documentElement.lang = 'hi';
                    document.documentElement.classList.add('lang-hi');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </Head>
      <body className="antialiased bg-[var(--background)]" style={{ backgroundColor: 'var(--background)' }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}