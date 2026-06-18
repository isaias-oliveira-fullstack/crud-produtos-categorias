<script lang="ts">
import { defineComponent } from "vue";
import type { Order } from "@shared/models/Order";
import type { OrderStatus } from "@shared/models/Order";
import { orderService } from "../services/orderService";
import { formatBRL } from "../utils/format";
import { orderStatusLabel } from "../utils/orderLabels";
import { digitsOnly } from "../utils/brValidation";
import { buildPaymentLinkMessage, waMeUrl } from "../utils/whatsapp";

const STATUSES: OrderStatus[] = [
  "awaiting_payment",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

export default defineComponent({
  name: "AdminOrdersView",

  data() {
    return {
      rows: [] as Order[],
      loading: false,
      statuses: STATUSES,
      paymentLinksDraft: {} as Record<string, string>,
    };
  },

  async mounted() {
    await this.reload();
  },

  methods: {
    formatBRL,
    orderStatusLabel,
    async reload(): Promise<void> {
      this.loading = true;
      try {
        this.rows = await orderService.listAll();
        this.rows.forEach((o) => {
          this.paymentLinksDraft[o.id] = o.paymentLink ?? "";
        });
      } catch {
        this.$toast.add({
          severity: "error",
          summary: "Pedidos",
          detail: "Não foi possível carregar os pedidos.",
          life: 4000,
        });
      } finally {
        this.loading = false;
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
    async onStatusChange(order: Order, value: string): Promise<void> {
      const status = value as OrderStatus;
      const res = await orderService.updateStatus(order.id, status);
      if (!res.ok) {
        this.$toast.add({ severity: "error", summary: "Pedido", detail: res.error, life: 4000 });
        await this.reload();
        return;
      }
      this.$toast.add({ severity: "success", summary: "Status atualizado", life: 2000 });
      await this.reload();
    },
    async savePaymentLink(orderId: string): Promise<void> {
      const link = (this.paymentLinksDraft[orderId] ?? "").trim();
      const res = await orderService.updatePaymentLink(orderId, link);
      if (!res.ok) {
        this.$toast.add({ severity: "error", summary: "Pedido", detail: res.error, life: 4000 });
        return;
      }
      this.$toast.add({ severity: "success", summary: "Link salvo", life: 2000 });
      await this.reload();
    },
    async sendPaymentWhatsapp(order: Order): Promise<void> {
      const link = (this.paymentLinksDraft[order.id] ?? order.paymentLink ?? "").trim();
      if (!link) {
        this.$toast.add({
          severity: "warn",
          summary: "Link obrigatório",
          detail: "Preencha e salve o link de pagamento.",
          life: 4000,
        });
        return;
      }

      const result = await orderService.updatePaymentLink(order.id, link);
      if (!result.ok) {
        this.$toast.add({ severity: "error", summary: "Pedido", detail: result.error, life: 4000 });
        return;
      }

      const customerPhone = digitsOnly(order.customer?.phone ?? "");
      if (customerPhone.length < 10) {
        this.$toast.add({
          severity: "warn",
          summary: "Telefone do cliente",
          detail: "O pedido não possui telefone válido do cliente para envio via WhatsApp.",
          life: 5000,
        });
        return;
      }
      const text = buildPaymentLinkMessage(order.id, order.total, link, order.customer?.fullName);
      window.open(waMeUrl(customerPhone, text), "_blank", "noopener,noreferrer");
    },
    confirmDelete(order: Order): void {
      this.$confirm.require({
        message: `Excluir pedido ${order.id}?`,
        header: "Confirmar exclusão",
        icon: "pi pi-exclamation-triangle",
        accept: async () => {
          const res = await orderService.remove(order.id);
          if (!res.ok) {
            this.$toast.add({ severity: "error", summary: "Pedido", detail: res.error, life: 4000 });
            return;
          }
          this.$toast.add({ severity: "success", summary: "Pedido removido", life: 2500 });
          await this.reload();
        },
      });
    },
    itemsCount(order: Order): number {
      return order.items.reduce((n, i) => n + i.quantity, 0);
    },
  },
});
</script>

<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-xl font-bold m-0">Pedidos</h1>
      <p class="m-0 mt-1 text-sm text-gray-600 dark:text-gray-400">
        Inclui pedidos PIX e WhatsApp. Informe o link de pagamento e envie ao cliente pelo WhatsApp.
      </p>
    </div>

    <DataTable :value="rows" :loading="loading" paginator :rows="8" responsive-layout="scroll">
      <Column field="id" header="ID" style="max-width: 8rem" />
      <Column field="userId" header="ID do usuário" />
      <Column header="Cliente" style="min-width: 8rem">
        <template #body="{ data }">
          <span class="text-xs">{{ data.customer?.fullName || "—" }}</span>
        </template>
      </Column>
      <Column header="Pag.">
        <template #body="{ data }">
          {{ paymentLabel(data) }}
        </template>
      </Column>
      <Column header="Data">
        <template #body="{ data }">
          {{ formatDate(data.createdAt) }}
        </template>
      </Column>
      <Column header="Itens">
        <template #body="{ data }">
          {{ itemsCount(data) }}
        </template>
      </Column>
      <Column header="Total">
        <template #body="{ data }">
          {{ formatBRL(data.total) }}
        </template>
      </Column>
      <Column header="Status">
        <template #body="{ data }">
          <select
            class="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-2 py-1 text-xs max-w-36"
            :value="data.status"
            @change="onStatusChange(data, ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="s in statuses" :key="s" :value="s">{{ orderStatusLabel(s) }}</option>
          </select>
        </template>
      </Column>
      <Column header="Link pagamento" style="min-width: 12rem">
        <template #body="{ data }">
          <div class="flex flex-col gap-1">
            <InputText
              v-model="paymentLinksDraft[data.id]"
              class="w-full text-xs"
              placeholder="https://..."
            />
            <Button
              label="Salvar link"
              size="small"
              class="text-xs!"
              @click="savePaymentLink(data.id)"
            />
          </div>
        </template>
      </Column>
      <Column header="WhatsApp" :exportable="false">
        <template #body="{ data }">
          <Button
            label="Enviar link de pagamento via WhatsApp"
            icon="pi pi-whatsapp"
            size="small"
            class="text-xs! whitespace-normal! h-auto! py-2!"
            @click="sendPaymentWhatsapp(data)"
          />
        </template>
      </Column>
      <Column header="Ações" :exportable="false">
        <template #body="{ data }">
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            aria-label="Excluir"
            @click="confirmDelete(data)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
