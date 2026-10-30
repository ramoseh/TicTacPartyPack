// Pega aquí la URL de la página de Ko-fi cuando exista.
// Mientras esté vacía (o no sea https), el aviso de donación permanece dormido.
export const DONATION_URL = '';

export const DONATION_ROUNDS_TARGET = 10;

export const DONATION_AUTO_HIDE_MS = 15000;

/** Only absolute HTTPS URLs are accepted, so a missing config never shows a broken link. */
export function isDonationConfigured(url: string = DONATION_URL): boolean {
  return /^https:\/\/\S+$/i.test(url);
}
