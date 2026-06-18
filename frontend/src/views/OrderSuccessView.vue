<script lang="ts">
import { defineComponent } from "vue";
import { Order, OrderStatus } from "@shared/models/Order";
import { orderService } from "../services/orderService";
import { storeSettingsService } from "../services/storeSettingsService";
import { maskCpfInput, maskPhoneBrInput } from "../utils/brValidation";
import { formatBRL } from "../utils/format";
import { orderStatusLabel as orderStatusLabelText } from "../utils/orderLabels";

export default defineComponent({
  name: "OrderSuccessView",

  data() {
    return {
      order: null as Order | null,
      notFound: false,
    };
  },

  computed: {
    paymentCfg() {
      return storeSettingsService.get().paymentSettings;
    },
    isPix(): boolean {
      return this.order?.paymentMethod === "pix";
    },
    isWhatsapp(): boolean {
      return this.order?.paymentMethod === "whatsapp";
    },
  },

  watch: {
    "$route.query.orderId": {
      immediate: true,
      handler() {
        this.loadOrder();
      },
    },
  },

  methods: {
    formatBRL,
    statusLabel(s: OrderStatus): string {
      return orderStatusLabelText(s);
    },
    async loadOrder(): Promise<void> {
      const raw = this.$route.query.orderId;
      const id = typeof raw === "string" ? raw : "";
      if (!id.trim()) {
        this.notFound = true;
        this.order = null;
        return;
      }

      try {
        const found = await orderService.getById(id);
        if (!found) {
          this.notFound = true;
          this.order = null;
          return;
        }
        this.notFound = false;
        this.order = found;
      } catch {
        this.notFound = true;
        this.order = null;
      }
    },
    formatDate(iso: string): string {
      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(iso));
    },
    paymentLabel(order: Order): string {
      return order.paymentMethod === "whatsapp" ? "WhatsApp" : "PIX";
    },
    async copyPix(): Promise<void> {
      const key = this.paymentCfg.pixKey;
      try {
        await navigator.clipboard.writeText(key);
        this.$toast.add({ severity: "success", summary: "Chave copiada", life: 2000 });
      } catch {
        this.$toast.add({ severity: "error", summary: "Não foi possível copiar", life: 2500 });
      }
    },
    deliveryLine(order: Order): string {
      if (order.shipping?.street && order.shipping?.city) {
        const s = order.shipping;
        const line1 = [s.street, s.number].filter(Boolean).join(", ");
        return `${line1} — ${s.neighborhood} — ${s.city}/${s.state}`;
      }
      return order.shippingAddress;
    },
    displayPhone(raw: string): string {
      return maskPhoneBrInput(raw || "");
    },
    displayCpf(raw: string): string {
      return maskCpfInput(raw || "");
    },
  },
});
</script>

<template>
  <section class="max-w-2xl mx-auto space-y-6">
    <div v-if="notFound" class="text-center space-y-4 py-8">
      <Message severity="warn" :closable="false">
        Não encontramos os dados deste pedido. Verifique o link ou acesse seus pedidos em “Minha conta”.
      </Message>
      <Button label="Voltar à loja" icon="pi pi-home" @click="$router.push({ name: 'home' })" />
    </div>

    <div v-else-if="order" class="space-y-6">
      <!-- PIX -->
      <template v-if="isPix">
        <div class="text-center space-y-2">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 mb-2"
          >
            <i class="pi pi-check text-3xl" aria-hidden="true" />
          </div>
          <h1 class="text-2xl font-bold m-0">Obrigado pela sua compra!</h1>
          <p class="m-0 text-gray-600 dark:text-gray-400 text-sm max-w-lg mx-auto">
            Seu pedido foi registrado. Para concluir, realize o pagamento via PIX com os dados abaixo.
          </p>
        </div>

        <Message severity="info" :closable="false" class="text-left!">
          <strong class="block mb-1">Importante</strong>
          O pedido só será confirmado após identificarmos o pagamento. Realize o PIX usando o QR Code ou a chave
          abaixo.
        </Message>

        <Card class="bg-gray-100! dark:bg-gray-800! border border-gray-200 dark:border-gray-700 text-left">
          <template #title>Pagamento via PIX</template>
          <template #content>
            <p class="m-0 text-sm text-gray-600 dark:text-gray-400">
              Escaneie o QR Code ou copie a chave PIX e finalize no app do seu banco.
            </p>
            <div v-if="paymentCfg.pixQrCode" class="mt-3 max-w-xs">
              <img
                :src="paymentCfg.pixQrCode"
                alt="QR Code PIX"
                class="w-full rounded border border-gray-200 dark:border-gray-600 bg-white p-2"
              />
            </div>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <code class="text-xs break-all bg-gray-200 dark:bg-gray-900 px-2 py-1 rounded flex-1 min-w-0">
                {{ paymentCfg.pixKey }}
              </code>
              <Button label="Copiar chave PIX" icon="pi pi-copy" size="small" @click="copyPix" />
            </div>
          </template>
        </Card>
      </template>

      <!-- WhatsApp -->
      <template v-else-if="isWhatsapp">
        <div class="text-center space-y-2">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 mb-2"
          >
            <i class="pi pi-whatsapp text-3xl" aria-hidden="true" />
          </div>
          <h1 class="text-2xl font-bold m-0">Pedido recebido!</h1>
          <p class="m-0 text-gray-600 dark:text-gray-400 text-sm max-w-lg mx-auto">
            Obrigado por comprar conosco.
          </p>
        </div>

        <Message severity="success" :closable="false" class="text-left!">
          Seu pedido foi enviado para nossa equipe via WhatsApp. Em breve você receberá um link de pagamento para
          concluir sua compra. Nossa equipe analisará o pedido e entrará em contato pelo número informado.
        </Message>

        <Card class="bg-gray-100! dark:bg-gray-800! border border-gray-200 dark:border-gray-700 text-left">
          <template #title>Próximos passos</template>
          <template #content>
            <p class="m-0 text-sm text-gray-700 dark:text-gray-300">
              Abra a conversa do WhatsApp que foi iniciada em outra aba com o resumo do seu pedido. O status do pedido
              permanece como <strong>{{ statusLabel(order.status) }}</strong> até o pagamento ser confirmado.
            </p>
          </template>
        </Card>
      </template>

      <Card class="bg-gray-100! dark:bg-gray-800! border border-gray-200 dark:border-gray-700 text-left">
        <template #title>Resumo do pedido</template>
        <template #content>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm m-0">
            <div>
              <dt class="text-gray-500 dark:text-gray-400">Número do pedido</dt>
              <dd class="font-mono font-semibold m-0 break-all">{{ order.id }}</dd>
            </div>
            <div>
              <dt class="text-gray-500 dark:text-gray-400">Data</dt>
              <dd class="m-0">{{ formatDate(order.createdAt) }}</dd>
            </div>
            <div>
              <dt class="text-gray-500 dark:text-gray-400">Status</dt>
              <dd class="m-0">{{ statusLabel(order.status) }}</dd>
            </div>
            <div>
              <dt class="text-gray-500 dark:text-gray-400">Forma de pagamento</dt>
              <dd class="m-0">{{ paymentLabel(order) }}</dd>
            </div>
            <div>
              <dt class="text-gray-500 dark:text-gray-400">Total</dt>
              <dd class="m-0 font-semibold text-emerald-700 dark:text-emerald-400">
                {{ formatBRL(order.total) }}
              </dd>
            </div>
          </dl>

          <Divider />

          <div v-if="order.customer?.fullName" class="mb-4">
            <p class="text-sm font-medium m-0 mb-2">Cliente</p>
            <ul class="list-none m-0 p-0 text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>{{ order.customer.fullName }}</li>
              <li>{{ order.customer.email }}</li>
              <li>{{ displayPhone(order.customer.phone) }}</li>
              <li>CPF: {{ displayCpf(order.customer.cpf) }}</li>
            </ul>
          </div>

          <div>
            <p class="text-sm font-medium m-0 mb-2">Entrega</p>
            <p class="m-0 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {{ deliveryLine(order) }}
            </p>
          </div>

          <Divider />

          <ul class="list-none m-0 p-0 space-y-2">
            <li
              v-for="(row, idx) in order.items"
              :key="idx"
              class="flex justify-between gap-3 text-sm"
            >
              <span>{{ row.product.name }} × {{ row.quantity }}</span>
              <span class="font-medium">{{ formatBRL(row.product.price * row.quantity) }}</span>
            </li>
          </ul>
        </template>
      </Card>

      <div class="flex flex-col sm:flex-row gap-2 justify-center">
        <Button label="Voltar à loja" icon="pi pi-home" @click="$router.push({ name: 'home' })" />
        <Button
          label="Ver meus pedidos"
          severity="secondary"
          outlined
          icon="pi pi-user"
          @click="$router.push({ name: 'profile-orders' })"
        />
      </div>
    </div>
  </section>
</template>
