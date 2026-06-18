<script lang="ts">
import { defineComponent } from "vue";
import type { PaymentMethod } from "@shared/models/Order";
import type { UserRecord } from "@shared/models/UserRecord";
import { useAuthStore } from "../stores/auth";
import { cartService } from "../services/cartService";
import { orderService } from "../services/orderService";
import { storeSettingsService } from "../services/storeSettingsService";
import {
  digitsOnly,
  isValidBrazilPhone,
  isValidCpf,
  isValidEmail,
  maskCpfInput,
  maskPhoneBrInput,
} from "../utils/brValidation";
import { formatBRL } from "../utils/format";
import { buildCheckoutMessage, waMeUrl } from "../utils/whatsapp";

const UFS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

export default defineComponent({
  name: "CheckoutView",

  data() {
    return {
      loading: true,
      ufs: [...UFS],
      fullName: "",
      email: "",
      phone: "",
      cpf: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      createAccount: false,
      password: "",
      passwordConfirm: "",
      paymentMethod: null as PaymentMethod | null,
      submitting: false,
      fieldErrors: {} as Record<string, string>,

      home: { label: "Início", to: "/" },
      breadcrumbItems: [] as Array<{ label: string; to?: string }>,
      isRedirecting: false,
    };
  },

  computed: {
    items() {
      return cartService.getItems();
    },
    total() {
      return cartService.getFinalPrice();
    },
    loggedIn(): boolean {
      return useAuthStore().isAuthenticated;
    },
    showPasswordFields(): boolean {
      return !this.loggedIn && this.createAccount;
    },
  },

  mounted(): void {
    const auth = useAuthStore();
    const u = auth.user;
    if (this.items.length === 0) {
    this.isRedirecting = true;

    this.$toast.add({
      severity: "warn",
      summary: "Carrinho vazio",
      detail: "Redirecionando para o carrinho...",
      life: 3000,
    });
    
    setTimeout(() => {
      this.$router.replace({ name: "cart" });
    }, 4000);

    return;
  }
    if (u) {
      this.fullName = u.name;
      this.email = u.email;
      if (u.phone) this.phone = maskPhoneBrInput(u.phone);
      if (u.cpf) this.cpf = maskCpfInput(u.cpf);
    }
  },
 
  watch: {
    id: {
      immediate: true,
      handler() {
      void this.load();
      },
    },
  },

  methods: {
    formatBRL,
    async load(): Promise<void> {
      this.loading = true;
      this.breadcrumbItems = [
        { label: "Produtos", to: "/products" },
        { label: "Finalizar Pedido", to: "/checkout" },
      ];
    },
    onPhoneInput(e: Event): void {
      const v = (e.target as HTMLInputElement).value;
      this.phone = maskPhoneBrInput(v);
    },
    onCpfInput(e: Event): void {
      const v = (e.target as HTMLInputElement).value;
      this.cpf = maskCpfInput(v);
    },
    clearFieldError(key: string): void {
      const next = { ...this.fieldErrors };
      delete next[key];
      this.fieldErrors = next;
    },
    validateForm(): boolean {
      const err: Record<string, string> = {};
      const name = this.fullName.trim();
      if (!name) err.fullName = "Informe o nome completo.";
      const email = this.email.trim();
      if (!email) err.email = "Informe o e-mail.";
      else if (!isValidEmail(email)) err.email = "E-mail inválido.";
      const phoneDigits = digitsOnly(this.phone);
      if (!phoneDigits) err.phone = "Informe o telefone (WhatsApp).";
      else if (!isValidBrazilPhone(this.phone)) err.phone = "Telefone inválido (use DDD + número).";
      const cpfDigits = digitsOnly(this.cpf);
      if (!cpfDigits) err.cpf = "Informe o CPF.";
      else if (!isValidCpf(this.cpf)) err.cpf = "CPF inválido.";

      if (!this.street.trim()) err.street = "Informe a rua.";
      if (!this.number.trim()) err.number = "Informe o número.";
      if (!this.neighborhood.trim()) err.neighborhood = "Informe o bairro.";
      if (!this.city.trim()) err.city = "Informe a cidade.";
      if (!this.state.trim()) err.state = "Selecione o estado.";

      if (this.showPasswordFields) {
        if (!this.password || this.password.length < 6) {
          err.password = "Senha com no mínimo 6 caracteres.";
        }
        if (this.password !== this.passwordConfirm) {
          err.passwordConfirm = "As senhas não coincidem.";
        }
      }

      if (!this.paymentMethod) err.paymentMethod = "Selecione PIX ou WhatsApp.";

      this.fieldErrors = err;
      return Object.keys(err).length === 0;
    },

    async resolveUser(): Promise<UserRecord | null> {
      const auth = useAuthStore();
      const user = auth.user;
      if (this.loggedIn) {
        return user!;
      }
      if (!this.createAccount) {
        this.$toast.add({
          severity: "warn",
          summary: "Login necessário",
          detail: "Marque “Criar uma conta com esses dados” ou faça login para continuar.",
          life: 5000,
        });
        await this.$router.push({ name: "login", query: { redirect: this.$route.fullPath } });
        return null;
      }
      const reg = await auth.register({
        name: this.fullName.trim(),
        email: this.email.trim(),
        password: this.password,
        phone: digitsOnly(this.phone),
        cpf: digitsOnly(this.cpf),
      });
      if (!reg.ok) {
        this.$toast.add({
          severity: "error",
          summary: "Cadastro",
          detail: reg.error,
          life: 5000,
        });
        return null;
      }
      this.$toast.add({
        severity: "success",
        summary: "Conta criada",
        detail: "Você foi conectado automaticamente.",
        life: 2500,
      });
      return reg.user;
    },

    async submit(): Promise<void> {
      if (!this.validateForm()) {
        this.$toast.add({
          severity: "warn",
          summary: "Revise o formulário",
          detail: "Corrija os campos destacados antes de finalizar.",
          life: 4000,
        });
        return;
      }
      if (this.items.length === 0) {
        this.$toast.add({
          severity: "warn",
          summary: "Carrinho vazio",
          detail: "Adicione produtos antes de finalizar.",
          life: 3000,
        });
        return;
      }

      this.submitting = true;
      try {
        const user = await this.resolveUser();
        if (!user) return;

        const customer = {
          fullName: this.fullName.trim(),
          email: this.email.trim().toLowerCase(),
          phone: digitsOnly(this.phone),
          cpf: digitsOnly(this.cpf),
        };
        
        const shipping = {
          street: this.street.trim(),
          number: this.number.trim(),
          neighborhood: this.neighborhood.trim(),
          city: this.city.trim(),
          state: this.state.trim().toUpperCase().slice(0, 2),
        };

        const msg = buildCheckoutMessage({
          items: this.items,
          total: this.total,
          customerName: customer.fullName,
          customerPhone: this.phone.trim(),
          shipping,
        });

        const order = await orderService.createFromCart({
          userId: user.id,
          items: cartService.getItems(),
          total: cartService.getFinalPrice(),
          customer,
          shipping,
          paymentMethod: this.paymentMethod!,
          whatsappMessageSnapshot: msg,
        });

        cartService.clear();

        if (this.paymentMethod === "whatsapp") {
          const storePhone = storeSettingsService.get().paymentSettings.whatsappNumber;
          const url = waMeUrl(storePhone, msg);
          window.open(url, "_blank", "noopener,noreferrer");
        }

        await this.$router.replace({
          name: "order-success",
          query: { orderId: order.id },
        });
      } finally {
        this.submitting = false;
      }
    },
  },
});
</script>

<template>
  <div v-if="isRedirecting"
     class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
  
  <div class="text-white text-center space-y-2">
    <i class="pi pi-spinner animate-spin text-[2em]! mb-3"></i>
    <p class="text-base">Você está sendo redirecionado para a página do carrinho...</p>
  </div>
</div>
  <section class="max-w-240 mx-auto pb-6 md:pb-8">
    <div>
      <h1 class="text-xl sm:text-2xl font-bold mb-3">Finalizar Pedido</h1>
      
    <AppBreadcrumb :home="home" :items="breadcrumbItems" />
      <p class="my-3 text-sm text-gray-600 dark:text-gray-400">
        Preencha seus dados, o endereço de entrega e a forma de pagamento para finalizar.
      </p>
    </div>

    <Card class="bg-gray-100! dark:bg-gray-800! text-gray-600! dark:text-gray-200! border border-gray-200 dark:border-gray-700 mb-3">
      <template #title>Resumo do pedido</template>
      <template #content>
        <ul class="list-none mt-2 p-0 space-y-2">
          <li v-for="row in items" :key="row.itemId ?? row.product.id" class="flex justify-between gap-3 text-sm">
            
          <div class="flex gap-3 text-gray-700 dark:text-gray-300">
            <img
              :src="row.product.mainImage || row.product.thumbnail || 'https://via.placeholder.com/160x160?text=Sem+imagem'"
              :alt="row.product.name"
              class="w-16 h-16 object-contain rounded border border-gray-200 dark:border-gray-700 bg-white"
            />
            <div class="flex flex-col">
              <h3 class="font-medium">{{ row.product.name }}</h3>
              <p class="m-0 text-sm uppercase text-gray-600 dark:text-gray-400">
                {{ row.product.category.title }}
              </p>
              <span class="text-sm text-gray-500 dark:text-gray-400">× {{ row.quantity }}</span>
            </div>
            </div>
            <span class="font-semibold text-emerald-700 dark:text-emerald-400">
              {{ formatBRL(row.product.price * row.quantity) }}
            </span>
          </li>
        </ul>
        <Divider />
        <div class="flex justify-between items-center font-semibold">
          <span>Total</span>
          <span class="text-emerald-700 dark:text-emerald-400">{{ formatBRL(total) }}</span>
        </div>
      </template>
    </Card>

    <Card class="bg-gray-100! dark:bg-gray-800! text-gray-600! dark:text-gray-200! border border-gray-200 dark:border-gray-700 mb-3">
      <template #title>Dados pessoais</template>
      <template #content>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium" for="chk-fullname">Nome completo *</label>
            <InputText
              id="chk-fullname"
              v-model="fullName"
              class="
                w-full 
                transition-colors! 
                bg-gray-200! 
                dark:bg-gray-900! 
                text-gray-900! 
                dark:text-gray-100! 
                border-gray-300! 
                dark:border-gray-700! 
                focus:ring-2 
                focus:ring-primary/50 
                focus:outline-none! 
                rounded-md!
              "
              :class="{ 'p-invalid': fieldErrors.fullName }"
              autocomplete="name"
              @input="clearFieldError('fullName')"
            />
            <small v-if="fieldErrors.fullName" class="text-red-600 dark:text-red-400">{{ fieldErrors.fullName }}</small>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium" for="chk-email">E-mail *</label>
            <InputText
              id="chk-email"
              v-model="email"
              type="email"
              class="
                w-full 
                transition-colors! 
                bg-gray-200! 
                dark:bg-gray-900! 
                text-gray-900! 
                dark:text-gray-100! 
                border-gray-300! 
                dark:border-gray-700! 
                focus:ring-2 
                focus:ring-primary/50 
                focus:outline-none! 
                rounded-md!
              "
              :class="{ 'p-invalid': fieldErrors.email }"
              autocomplete="email"
              @input="clearFieldError('email')"
            />
            <small v-if="fieldErrors.email" class="text-red-600 dark:text-red-400">{{ fieldErrors.email }}</small>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium" for="chk-phone">Telefone (WhatsApp) *</label>
            <InputText
              id="chk-phone"
              :model-value="phone"
              class="
                w-full 
                transition-colors! 
                bg-gray-200! 
                dark:bg-gray-900! 
                text-gray-900! 
                dark:text-gray-100! 
                border-gray-300! 
                dark:border-gray-700! 
                focus:ring-2 
                focus:ring-primary/50 
                focus:outline-none! 
                rounded-md!
              "
              :class="{ 'p-invalid': fieldErrors.phone }"
              inputmode="numeric"
              autocomplete="tel"
              placeholder="(00) 00000-0000"
              @input="onPhoneInput($event); clearFieldError('phone')"
            />
            <small v-if="fieldErrors.phone" class="text-red-600 dark:text-red-400">{{ fieldErrors.phone }}</small>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium" for="chk-cpf">CPF *</label>
            <InputText
              id="chk-cpf"
              :model-value="cpf"
              class="
                w-full 
                transition-colors! 
                bg-gray-200! 
                dark:bg-gray-900! 
                text-gray-900! 
                dark:text-gray-100! 
                border-gray-300! 
                dark:border-gray-700! 
                focus:ring-2 
                focus:ring-primary/50 
                focus:outline-none! 
                rounded-md!
              "
              :class="{ 'p-invalid': fieldErrors.cpf }"
              inputmode="numeric"
              placeholder="000.000.000-00"
              @input="onCpfInput($event); clearFieldError('cpf')"
            />
            <small v-if="fieldErrors.cpf" class="text-red-600 dark:text-red-400">{{ fieldErrors.cpf }}</small>
          </div>
        </div>
      </template>
    </Card>

    <Card class="bg-gray-100! dark:bg-gray-800! text-gray-600! dark:text-gray-200! border border-gray-200 dark:border-gray-700 mb-3">
      <template #title>Endereço de entrega</template>
      <template #content>
        <div class="grid grid-cols-1 sm:grid-cols-6 gap-4">
          <div class="flex flex-col gap-1 sm:col-span-5">
            <label class="text-sm font-medium" for="chk-street">Rua *</label>
            <InputText
              id="chk-street"
              v-model="street"
              class="
                w-full 
                transition-colors! 
                bg-gray-200! 
                dark:bg-gray-900! 
                text-gray-900! 
                dark:text-gray-100! 
                border-gray-300! 
                dark:border-gray-700! 
                focus:ring-2 
                focus:ring-primary/50 
                focus:outline-none! 
                rounded-md!
              "
              :class="{ 'p-invalid': fieldErrors.street }"
              autocomplete="street-address"
              @input="clearFieldError('street')"
            />
            <small v-if="fieldErrors.street" class="text-red-600 dark:text-red-400">{{ fieldErrors.street }}</small>
          </div>
          <div class="flex flex-col gap-1 sm:col-span-1">
            <label class="text-sm font-medium" for="chk-num">Número *</label>
            <InputText
              id="chk-num"
              v-model="number"
              class="
                w-full 
                transition-colors! 
                bg-gray-200! 
                dark:bg-gray-900! 
                text-gray-900! 
                dark:text-gray-100! 
                border-gray-300! 
                dark:border-gray-700! 
                focus:ring-2 
                focus:ring-primary/50 
                focus:outline-none! 
                rounded-md!
              "
              :class="{ 'p-invalid': fieldErrors.number }"
              @input="clearFieldError('number')"
            />
            <small v-if="fieldErrors.number" class="text-red-600 dark:text-red-400">{{ fieldErrors.number }}</small>
          </div>
          <div class="flex flex-col gap-1 sm:col-span-3">
            <label class="text-sm font-medium" for="chk-bairro">Bairro *</label>
            <InputText
              id="chk-bairro"
              v-model="neighborhood"
              class="
                w-full 
                transition-colors! 
                bg-gray-200! 
                dark:bg-gray-900! 
                text-gray-900! 
                dark:text-gray-100! 
                border-gray-300! 
                dark:border-gray-700! 
                focus:ring-2 
                focus:ring-primary/50 
                focus:outline-none! 
                rounded-md!
              "
              :class="{ 'p-invalid': fieldErrors.neighborhood }"
              @input="clearFieldError('neighborhood')"
            />
            <small v-if="fieldErrors.neighborhood" class="text-red-600 dark:text-red-400">{{
              fieldErrors.neighborhood
            }}</small>
          </div>
          <div class="flex flex-col gap-1 sm:col-span-2">
            <label class="text-sm font-medium" for="chk-city">Cidade *</label>
            <InputText
              id="chk-city"
              v-model="city"
              class="
                w-full 
                transition-colors! 
                bg-gray-200! 
                dark:bg-gray-900! 
                text-gray-900! 
                dark:text-gray-100! 
                border-gray-300! 
                dark:border-gray-700! 
                focus:ring-2 
                focus:ring-primary/50 
                focus:outline-none! 
                rounded-md!
              "
              :class="{ 'p-invalid': fieldErrors.city }"
              autocomplete="address-level2"
              @input="clearFieldError('city')"
            />
            <small v-if="fieldErrors.city" class="text-red-600 dark:text-red-400">{{ fieldErrors.city }}</small>
          </div>
          <div class="flex flex-col gap-1 sm:col-span-1">
            <label class="text-sm font-medium" for="chk-uf">UF *</label>
            <select
              id="chk-uf"
              v-model="state"
              class="
                w-full 
                transition-colors! 
                bg-gray-200! 
                dark:bg-gray-900! 
                text-gray-900! 
                dark:text-gray-100! 
                border-gray-300! 
                dark:border-gray-700! 
                focus:ring-2 
                focus:ring-primary/50 
                focus:outline-none! 
                rounded-md!
                px-3 
                py-2 
                text-sm
              "
              :class="{ 'p-invalid': fieldErrors.state }"
              @change="clearFieldError('state')"
            >
              <option value="">—</option>
              <option v-for="uf in ufs" :key="uf" :value="uf">{{ uf }}</option>
            </select>
            <small v-if="fieldErrors.state" class="text-red-600 dark:text-red-400">{{ fieldErrors.state }}</small>
          </div>
        </div>
      </template>
    </Card>

    <Card
      v-if="!loggedIn"
      class="bg-gray-100! dark:bg-gray-800! text-gray-600! dark:text-gray-200! border border-gray-200 dark:border-gray-700"
    >
      <template #title>Criar conta</template>
      <template #content>
        <div class="flex items-start gap-3">
          <Checkbox 
            v-model="createAccount" 
            binary 
            input-id="chk-acc" 
            @change="clearFieldError('password')"
            class="
              [&_.p-checkbox-box]:transition-colors! 
              [&_.p-checkbox-box]:bg-gray-200! 
              [&_.p-checkbox-box]:dark:bg-gray-900! 
              [&_.p-checkbox-box]:text-gray-900! 
              [&_.p-checkbox-box]:dark:text-gray-100! 
              [&_.p-checkbox-box]:border-gray-300! 
              [&_.p-checkbox-box]:dark:border-gray-700!
              [&_.p-checkbox-icon]:text-green-600! 
              [&_.p-checkbox-box]:focus:ring-2 
              [&_.p-checkbox-box]:focus:ring-primary/50 
              [&_.p-checkbox-box]:focus:outline-none!
            "  
          />
          <div>
            <label for="chk-acc" class="cursor-pointer text-sm font-medium">Criar uma conta com esses dados</label>
            <p class="m-0 mt-1 text-xs text-gray-600 dark:text-gray-400">
              Você poderá acompanhar pedidos e favoritos com o mesmo e-mail e senha.
            </p>
          </div>
        </div>
        <div v-if="showPasswordFields" class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium" for="chk-pw">Senha *</label>
            <Password
              id="chk-pw"
              v-model="password"
              class="
                [&_.p-inputtext]:w-full 
                [&_.p-inputtext]:transition-colors! 
                [&_.p-inputtext]:bg-gray-200! 
                [&_.p-inputtext]:dark:bg-gray-900! 
                [&_.p-inputtext]:text-gray-900! 
                [&_.p-inputtext]:dark:text-gray-100! 
                [&_.p-inputtext]:border-gray-300! 
                [&_.p-inputtext]:dark:border-gray-700! 
                [&_.p-inputtext]:focus:ring-2 
                [&_.p-inputtext]:focus:ring-primary/50 
                [&_.p-inputtext]:focus:outline-none!
              "
              :input-class="{
                'p-invalid transition-colors! bg-gray-200! dark:bg-gray-900! text-gray-900! dark:text-gray-100! border-gray-300! dark:border-gray-700! focus:ring-2 focus:ring-primary/50 focus:outline-none!': fieldErrors.password 
              }"
              toggle-mask
              :feedback="false"
              @update:model-value="clearFieldError('password')"
            />
            <small v-if="fieldErrors.password" class="text-red-600 dark:text-red-400">{{ fieldErrors.password }}</small>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium" for="chk-pw2">Confirmar senha *</label>
            <Password
              id="chk-pw2"
              v-model="passwordConfirm"
              class="
                [&_.p-inputtext]:w-full 
                [&_.p-inputtext]:transition-colors! 
                [&_.p-inputtext]:bg-gray-200! 
                [&_.p-inputtext]:dark:bg-gray-900! 
                [&_.p-inputtext]:text-gray-900! 
                [&_.p-inputtext]:dark:text-gray-100! 
                [&_.p-inputtext]:border-gray-300! 
                [&_.p-inputtext]:dark:border-gray-700! 
                [&_.p-inputtext]:focus:ring-2 
                [&_.p-inputtext]:focus:ring-primary/50 
                [&_.p-inputtext]:focus:outline-none!
              "
              :input-class="{ 'p-invalid': fieldErrors.passwordConfirm }"
              toggle-mask
              :feedback="false"
              @update:model-value="clearFieldError('passwordConfirm')"
            />
            <small v-if="fieldErrors.passwordConfirm" class="text-red-600 dark:text-red-400">{{
              fieldErrors.passwordConfirm
            }}</small>
          </div>
        </div>
        <p v-else class="m-0 mt-2 text-xs text-gray-600 dark:text-gray-400">
          Já tem conta?
          <router-link
            :to="{ name: 'login', query: { redirect: $route.fullPath } }"
            class="text-emerald-600 font-medium"
          >
            Entrar
          </router-link>
        </p>
      </template>
    </Card>

    <Card class="bg-gray-100! dark:bg-gray-800! text-gray-600! dark:text-gray-200! border border-gray-200 dark:border-gray-700">
      <template #title>Pagamento</template>
      <template #content>
        <p class="text-sm text-gray-600 dark:text-gray-400 m-0 mb-3">Escolha uma forma de pagamento (obrigatório).</p>
        <div class="flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <RadioButton
              v-model="paymentMethod"
              input-id="pay-pix"
              value="pix"
              @change="clearFieldError('paymentMethod')"
              class="
                [&_.p-radiobutton-box]:transition-colors! 
                [&_.p-radiobutton-box]:bg-gray-200! 
                [&_.p-radiobutton-box]:dark:bg-gray-900! 
                [&_.p-radiobutton-box]:text-gray-900! 
                [&_.p-radiobutton-box]:dark:text-gray-100! 
                [&_.p-radiobutton-box]:border-gray-300! 
                [&_.p-radiobutton-box]:dark:border-gray-700!
                [&_.p-radiobutton-icon]:bg-green-600! 
                [&_.p-radiobutton-icon]:dark:bg-green-200! 
                [&_.p-radiobutton-box]:focus:ring-2 
                [&_.p-radiobutton-box]:focus:ring-primary/50 
                [&_.p-radiobutton-box]:focus:outline-none!
              " 
            />
            <label for="pay-pix" class="cursor-pointer">PIX (QR Code e chave na página de confirmação)</label>
          </div>
          <div class="flex items-center gap-2">
            <RadioButton
              v-model="paymentMethod"
              input-id="pay-wa"
              value="whatsapp"
              @change="clearFieldError('paymentMethod')"
              class="
                [&_.p-radiobutton-box]:transition-colors! 
                [&_.p-radiobutton-box]:bg-gray-200! 
                [&_.p-radiobutton-box]:dark:bg-gray-900! 
                [&_.p-radiobutton-box]:text-gray-900! 
                [&_.p-radiobutton-box]:dark:text-gray-100! 
                [&_.p-radiobutton-box]:border-gray-300! 
                [&_.p-radiobutton-box]:dark:border-gray-700!
                [&_.p-radiobutton-icon]:bg-green-600! 
                [&_.p-radiobutton-icon]:dark:bg-green-200! 
                [&_.p-radiobutton-box]:focus:ring-2 
                [&_.p-radiobutton-box]:focus:ring-primary/50 
                [&_.p-radiobutton-box]:focus:outline-none!
              " 
            />
            <label for="pay-wa" class="cursor-pointer"
              >WhatsApp (O pedido fica aguardando pagamento)</label
            >
          </div>
        </div>
        <small v-if="fieldErrors.paymentMethod" class="text-red-600 dark:text-red-400 block mt-2">{{
          fieldErrors.paymentMethod
        }}</small>
      </template>
    </Card>

    <div class="flex flex-wrap gap-2">
      <Button
        label="Finalizar pedido"
        icon="pi pi-check"
        :loading="submitting"
        :disabled="items.length === 0"
        @click="submit"
      />
      <Button label="Voltar ao carrinho" severity="secondary" outlined @click="$router.push({ name: 'cart' })" />
    </div>
  </section>
</template>