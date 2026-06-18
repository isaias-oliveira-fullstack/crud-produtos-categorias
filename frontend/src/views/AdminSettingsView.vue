<script lang="ts">
import { defineComponent } from "vue";
import type { StoreThemePreference } from "@shared/models/StoreSettings";
import { storeSettingsService } from "../services/storeSettingsService";

export default defineComponent({
  name: "AdminSettingsView",

  data() {
    return {
      form: storeSettingsService.get(),
      saving: false,
    };
  },

  methods: {
    save(): void {
      if (!this.form.storeName.trim()) {
        this.$toast.add({
          severity: "warn",
          summary: "Nome da loja",
          detail: "Informe o nome da loja.",
          life: 3000,
        });
        return;
      }
      if (!this.form.paymentSettings.whatsappNumber.trim()) {
        this.$toast.add({
          severity: "warn",
          summary: "WhatsApp",
          detail: "Informe o número do WhatsApp (apenas dígitos com DDI).",
          life: 3000,
        });
        return;
      }
      if (!this.form.paymentSettings.pixKey.trim()) {
        this.$toast.add({
          severity: "warn",
          summary: "PIX",
          detail: "Informe a chave PIX.",
          life: 3000,
        });
        return;
      }
      this.saving = true;
      try {
        this.form = storeSettingsService.update({
          storeName: this.form.storeName.trim(),
          tagline: this.form.tagline.trim(),
          themePreference: this.form.themePreference as StoreThemePreference,
          contactEmail: this.form.contactEmail.trim(),
          generalNotes: this.form.generalNotes.trim(),
          paymentSettings: {
            whatsappNumber: this.form.paymentSettings.whatsappNumber.trim(),
            pixKey: this.form.paymentSettings.pixKey.trim(),
            pixQrCode: this.form.paymentSettings.pixQrCode.trim(),
          },
        });
        this.$toast.add({ severity: "success", summary: "Configurações salvas", life: 2500 });
      } finally {
        this.saving = false;
      }
    },
    reset(): void {
      this.$confirm.require({
        message: "Restaurar valores padrão da loja?",
        header: "Confirmar",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          this.form = storeSettingsService.reset();
          this.$toast.add({ severity: "info", summary: "Padrões restaurados", life: 2500 });
        },
      });
    },
    async onQrFile(ev: Event): Promise<void> {
      const input = ev.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      this.form.paymentSettings.pixQrCode = dataUrl;
    },
  },
});
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-xl font-bold m-0">Configurações da loja</h1>
      <p class="m-0 mt-1 text-sm text-gray-600 dark:text-gray-400">
        Identidade, pagamentos (PIX / WhatsApp) e textos gerais — persistidos no localStorage.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-4 max-w-2xl">
      <h2 class="text-base font-semibold m-0">Identidade</h2>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="sname">Nome da loja</label>
        <InputText id="sname" v-model="form.storeName" class="w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="stag">Tagline</label>
        <InputText id="stag" v-model="form.tagline" class="w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="stheme">Tema básico</label>
        <select
          id="stheme"
          v-model="form.themePreference"
          class="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
        >
          <option value="system">Sistema (respeita o toggle do usuário)</option>
          <option value="light">Claro</option>
          <option value="dark">Escuro</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="semail">E-mail de contato</label>
        <InputText id="semail" v-model="form.contactEmail" type="email" class="w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="snotes">Observações gerais</label>
        <Textarea id="snotes" v-model="form.generalNotes" rows="4" auto-resize class="w-full" />
      </div>

      <Divider />

      <h2 class="text-base font-semibold m-0">Pagamentos (paymentSettings)</h2>
      <p class="text-xs text-gray-600 dark:text-gray-400 m-0">
        WhatsApp (DDI + DDD + número), chave PIX e QR Code exibidos no checkout e na confirmação.
      </p>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="wa">WhatsApp (somente números, ex.: 5511999999999)</label>
        <InputText id="wa" v-model="form.paymentSettings.whatsappNumber" class="w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium" for="pix">Chave PIX</label>
        <InputText id="pix" v-model="form.paymentSettings.pixKey" class="w-full" />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium">QR Code PIX (imagem)</label>
        <input type="file" accept="image/*" class="text-sm" @change="onQrFile" />
        <img
          v-if="form.paymentSettings.pixQrCode"
          :src="form.paymentSettings.pixQrCode"
          alt="QR PIX"
          class="max-w-xs rounded border border-gray-200 dark:border-gray-600 bg-white p-2"
        />
      </div>

      <div class="flex flex-wrap gap-2">
        <Button label="Salvar" icon="pi pi-save" :loading="saving" @click="save" />
        <Button label="Restaurar padrões" severity="secondary" outlined icon="pi pi-refresh" @click="reset" />
      </div>
    </div>
  </div>
</template>
