<script lang="ts">
import { defineComponent } from "vue";
import { orderService } from "../services/orderService";
import { formatBRL } from "../utils/format";
import type { Order } from "@shared/models/Order";
import { authService } from "../services/authService";
import { productService } from "../services/productService";
import { downloadCsv } from "../utils/csv";
import { orderStatusLabel } from "../utils/orderLabels";

export default defineComponent({
  name: "AdminReportsView",

  data() {
    return {
      orders: [] as Order[],
      summary: { orders: 0, revenue: 0, itemsSold: 0 },
    };
  },

  async mounted() {
    this.orders = await orderService.listAll();
    this.summary = await orderService.summary();
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
    async exportOrders(): Promise<void> {
      const orders = await orderService.listAll();
      const rows = orders.map((o) => [
        o.id,
        String(o.userId),
        orderStatusLabel(o.status),
        o.paymentMethod,
        formatBRL(o.total),
        this.formatDate(o.createdAt),
        o.customer?.fullName ?? "",
        o.customer?.email ?? "",
        o.customer?.phone ?? "",
        o.shippingAddress.replace(/\r?\n/g, " "),
      ]);
      downloadCsv(
        "pedidos.csv",
        ["id", "userId", "status", "pagamento", "total", "data", "cliente", "email", "telefone", "endereco"],
        rows
      );
      this.$toast.add({ severity: "success", summary: "Exportação", detail: "pedidos.csv", life: 2500 });
    },
    async exportUsers(): Promise<void> {
      const rows = authService.getUsers().map((u) => [String(u.id), u.name, u.email, u.role]);
      downloadCsv("usuarios.csv", ["id", "nome", "email", "papel"], rows);
      this.$toast.add({ severity: "success", summary: "Exportação", detail: "usuarios.csv", life: 2500 });
    },
    async exportProducts(): Promise<void> {
      const res = await productService.fetchPage({ limit: 200, skip: 0 });
      const merged = productService.getMergedCatalog(res.products);
      const rows = merged.map((p) => [
        String(p.id),
        p.name,
        formatBRL(p.price),
        p.category.title,
        p.localOnly ? "local" : "api",
      ]);
      downloadCsv("produtos.csv", ["id", "nome", "preco", "categoria", "origem"], rows);
      this.$toast.add({ severity: "success", summary: "Exportação", detail: "produtos.csv", life: 2500 });
    },
  },
});
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold m-0">Relatórios</h1>
        <p class="m-0 mt-1 text-sm text-gray-600 dark:text-gray-400">
          Indicadores e exportação CSV (Excel) dos dados simulados.
        </p>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button label="Exportar produtos" icon="pi pi-download" outlined @click="exportProducts" />
        <Button label="Exportar pedidos" icon="pi pi-download" outlined @click="exportOrders" />
        <Button label="Exportar usuários" icon="pi pi-download" outlined @click="exportUsers" />
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card class="bg-white/60 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700">
        <template #title>Pedidos</template>
        <template #content>
          <p class="text-3xl font-bold m-0">{{ summary.orders }}</p>
        </template>
      </Card>
      <Card class="bg-white/60 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700">
        <template #title>Itens vendidos</template>
        <template #content>
          <p class="text-3xl font-bold m-0">{{ summary.itemsSold }}</p>
        </template>
      </Card>
      <Card class="bg-white/60 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700">
        <template #title>Receita</template>
        <template #content>
          <p class="text-2xl font-bold m-0">{{ formatBRL(summary.revenue) }}</p>
        </template>
      </Card>
    </div>

    <DataTable :value="orders" paginator :rows="10" responsive-layout="scroll">
      <Column field="id" header="ID" />
      <Column field="userId" header="Usuário" />
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
    </DataTable>
  </div>
</template>
