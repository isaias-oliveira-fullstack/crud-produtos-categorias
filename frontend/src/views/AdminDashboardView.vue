<script lang="ts">
import { defineComponent } from "vue";
import { authService } from "../services/authService";
import { orderService } from "../services/orderService";
import { productService } from "../services/productService";
import { formatBRL } from "../utils/format";

export default defineComponent({
  name: "AdminDashboardView",

  data() {
    return {
      users: 0,
      localProducts: 0,
      summary: { orders: 0, revenue: 0, itemsSold: 0 },
    };
  },

async mounted() {
    this.users = authService.getUsers().length;
    this.summary = await orderService.summary();
    //this.localProducts = productService.listLocal().length;
    productService.listAll().then((products) => {
      this.localProducts = products.length;
    });
  },

  methods: {
    formatBRL,
  },
});
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-bold m-0">Painel</h1>
      <p class="m-0 mt-1 text-sm text-gray-600 dark:text-gray-400">
        Visão geral da simulação (dados persistidos no navegador).
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <Card class="transition-colors! bg-gray-200! dark:bg-gray-900! text-gray-900! dark:text-gray-100! border-gray-300! dark:border-gray-700!">
        <template #title>Usuários</template>
        <template #content>
          <p class="text-3xl font-bold m-0">{{ users }}</p>
        </template>
      </Card>
      <Card class="transition-colors! bg-gray-200! dark:bg-gray-900! text-gray-900! dark:text-gray-100! border-gray-300! dark:border-gray-700!">
        <template #title>Produtos</template>
        <template #content>
          <p class="text-3xl font-bold m-0">{{ localProducts }}</p>
        </template>
      </Card>
      <Card class="transition-colors! bg-gray-200! dark:bg-gray-900! text-gray-900! dark:text-gray-100! border-gray-300! dark:border-gray-700!">
        <template #title>Pedidos</template>
        <template #content>
          <p class="text-3xl font-bold m-0">{{ summary.orders }}</p>
        </template>
      </Card>
      <Card class="transition-colors! bg-gray-200! dark:bg-gray-900! text-gray-900! dark:text-gray-100! border-gray-300! dark:border-gray-700!">
        <template #title>Receita</template>
        <template #content>
          <p class="text-2xl font-bold m-0">{{ formatBRL(summary.revenue) }}</p>
        </template>
      </Card>
    </div>

    <div class="flex flex-wrap gap-2">
      <Button label="Usuários" icon="pi pi-users" outlined @click="$router.push({ name: 'admin-users' })" />
      <Button label="Pedidos" icon="pi pi-list" outlined @click="$router.push({ name: 'admin-orders' })" />
      <Button label="Configurações" icon="pi pi-cog" outlined @click="$router.push({ name: 'admin-settings' })" />
    </div>

    <Message severity="info" :closable="false">
      Use o menu lateral para gerenciar usuários, pedidos, produtos locais, relatórios e configurações da loja. A API pública continua sendo a fonte principal do catálogo.
    </Message>
  </div>
</template>
