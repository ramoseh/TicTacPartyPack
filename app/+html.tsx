import { PropsWithChildren } from 'react';
import { ScrollViewStyleReset } from 'expo-router/html';

const backgroundStyle = 'html,body{background-color:#0F0F1B;}';
const baseUrl = process.env.EXPO_BASE_URL ?? '';
const basePath = (path: string) => `${baseUrl}${path}`;

const serviceWorkerRegistration = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('${basePath('/sw.js')}', { scope: '${basePath('/')}' }).catch(function (error) {
      console.error('Service worker registration failed', error);
    });
  });
}
`;

// Root HTML for every statically exported web route (Expo SDK 54 / expo-router 6).
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#0F0F1B" />
        <link rel="manifest" href={basePath('/manifest.json')} />
        <link rel="apple-touch-icon" sizes="180x180" href={basePath('/apple-touch-icon.png')} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="TicTac" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: backgroundStyle }} />
        {process.env.NODE_ENV === 'production' && (
          <script dangerouslySetInnerHTML={{ __html: serviceWorkerRegistration }} />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
