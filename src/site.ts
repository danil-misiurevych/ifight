// Настройки сайта в одном месте.
export const SITE = {
  nazwa: 'iFight',
  haslo: 'Kalendarz turniejów bokserskich w Polsce',
  opis:
    'Nadchodzące turnieje bokserskie w Polsce w jednym miejscu: daty, miasta, kategorie wiekowe, terminy zgłoszeń i linki do komunikatów organizatorów.',
  // Адрес для присылки турниров (показывается на странице «O serwisie»).
  email: 'danil.misiurevych@gmail.com',
  // За сколько дней до дедлайна заявок подсвечивать его как «скоро».
  dniWkrotce: 7,
} as const;
