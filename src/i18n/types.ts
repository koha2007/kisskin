export type Locale = 'ko' | 'en'

export interface Translations {
  [key: string]: string | Translations
}
