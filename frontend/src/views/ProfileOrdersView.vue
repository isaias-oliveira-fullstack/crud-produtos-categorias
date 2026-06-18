<script lang="ts">
import { defineComponent } from "vue";
import { useAuthStore } from "../stores/auth";
import { orderService } from "../services/orderService";
import { Order } from "@shared/models/Order";
import { CartItem } from "@shared/models/CartItem";
import { formatBRL } from "../utils/format";
import { orderStatusLabel } from "../utils/orderLabels";

export default defineComponent({
  name: "ProfileOrdersView",

  data() {
    return {
      orders: [] as Order[],
    };
  },

  async mounted() {
    await this.refresh();
  },

  methods: {
    formatBRL,
    orderStatusLabel,
    formatDate(iso: string): string {
      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(iso));
    },
    async refresh(): Promise<void> {
      const auth = useAuthStore();
      const u = auth.user;
      if (!u) return;
      this.orders = await orderService.listForUser(u.id);
    },
    itemsCount(order: Order): number {
      return order.items.reduce((n: number, i: CartItem) => n + i.quantity, 0);
    },
  },
});
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-bold m-0">Meus pedidos</h1>
    <Card class="bg-gray-100! dark:bg-gray-800! border border-gray-200 dark:border-gray-700">
      <template #content>
        <div v-if="orders.length === 0" class="text-sm text-gray-600 dark:text-gray-400">
          Nenhum pedido ainda.
        </div>
        <DataTable v-else :value="orders" striped-rows class="text-sm" responsive-layout="scroll">
          <Column field="id" header="ID" />
          <Column header="Data">
            <template #body="{ data }">
              {{ formatDate(data.createdAt) }}
            </template>
          </Column>
          <Column header="Total">
            <template #body="{ data }">
              {{ formatBRL(data.total) }}
            </template>
          </Column>
          <Column header="Status">
            <template #body="{ data }">
              {{ orderStatusLabel(data.status) }}
            </template>
          </Column>
          <Column header="Itens">
            <template #body="{ data }">
              {{ itemsCount(data) }}
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>
