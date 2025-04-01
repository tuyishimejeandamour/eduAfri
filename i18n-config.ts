export const i18n = {
    defaultLocale: "rw",
    locales: ["en", "rw", "sw", "fr"],
  } as const;
  
  export type Locale = (typeof i18n)["locales"][number];