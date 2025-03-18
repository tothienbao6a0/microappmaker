import React, { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Force dark mode
    document.documentElement.classList.add('dark');
    document.documentElement.style.colorScheme = 'dark';
    
    // Remove any light mode classes
    document.documentElement.classList.remove('light');

    // Debugging: Log the current theme
    console.log('Current theme:', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp; 