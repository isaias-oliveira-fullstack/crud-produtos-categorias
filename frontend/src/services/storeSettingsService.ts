import type { StoreSettings, StoreThemePreference } from "@shared/models/StoreSettings";
import { STORAGE } from "./storageKeys";

const DEFAULTS: StoreSettings = {
  storeName: "CRUD de Products e Categories com Repository, Service e Controller",
  tagline: "Sua loja online, simples assim.",
  themePreference: "system",
  contactEmail: "suporte@skynetsites.com.br",
  generalNotes: "Entrega simulada. Pagamento não é processado.",
  paymentSettings: {
    whatsappNumber: "5585986891116",
    pixKey: "05ed170a-9ddf-4526-94ac-d17affc230bc",
    pixQrCode:
      "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=00020126580014BR.GOV.BCB.PIX013605ed170a-9ddf-4526-94ac-d17affc230bc5204000053039865802BR5925Francisco%20Isaias%20Oliveira6009SAO%20PAULO62140510dvfzXaciz76304B02E",
  },
};

function read(): StoreSettings {
  try {
    const raw = localStorage.getItem(STORAGE.STORE_SETTINGS);
    if (!raw) return { ...DEFAULTS, paymentSettings: { ...DEFAULTS.paymentSettings } };
    const parsed = JSON.parse(raw) as Partial<StoreSettings>;
    return {
      ...DEFAULTS,
      ...parsed,
      paymentSettings: { ...DEFAULTS.paymentSettings, ...parsed.paymentSettings },
    };
  } catch {
    return { ...DEFAULTS, paymentSettings: { ...DEFAULTS.paymentSettings } };
  }
}

function write(settings: StoreSettings): void {
  localStorage.setItem(STORAGE.STORE_SETTINGS, JSON.stringify(settings));
}

export const storeSettingsService = {
  init(): void {
    if (!localStorage.getItem(STORAGE.STORE_SETTINGS)) {
      write({ ...DEFAULTS });
    }
  },

  get(): StoreSettings {
    return read();
  },

  update(patch: Partial<StoreSettings>): StoreSettings {
    const next = { ...read(), ...patch };
    write(next);
    return next;
  },

  reset(): StoreSettings {
    write({ ...DEFAULTS });
    return read();
  },

  setThemePreference(value: StoreThemePreference): StoreSettings {
    return this.update({ themePreference: value });
  },
};
