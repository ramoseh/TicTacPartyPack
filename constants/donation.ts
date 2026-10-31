// Mientras esté vacía (o no sea https), el aviso y el icono de donación permanecen ocultos.
export const DONATION_URL = 'https://ko-fi.com/hivan17';

export const DONATION_ROUNDS_TARGET = 10;

export const DONATION_AUTO_HIDE_MS = 15000;

/** Only absolute HTTPS URLs are accepted, so a missing config never shows a broken link. */
export function isDonationConfigured(url: string = DONATION_URL): boolean {
  return /^https:\/\/\S+$/i.test(url);
}
