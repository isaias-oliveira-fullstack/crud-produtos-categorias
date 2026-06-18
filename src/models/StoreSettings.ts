import type { PaymentSettings } from "./PaymentSettings";

export type StoreThemePreference = "light" | "dark" | "system";

export interface StoreSettings {
  storeName: string;
  tagline: string;
  themePreference: StoreThemePreference;
  contactEmail: string;
  /** Texto livre para políticas, horário, etc. */
  generalNotes: string;
  paymentSettings: PaymentSettings;
}
