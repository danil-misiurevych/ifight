// Default share image for pages without their own: /og/strona.png
import type { APIRoute } from 'astro';
import { obrazKarty, odpowiedzPng } from '../../lib/og';

export const GET: APIRoute = async () =>
  odpowiedzPng(
    await obrazKarty({
      tytul: 'Kalendarz boksu w Polsce',
      dopisek: 'Turnieje, gale, wydarzenia charytatywne i sparingi w jednym miejscu',
    }),
  );
