<script lang="ts">
import { defineComponent } from "vue";
import { useAuthStore } from "../stores/auth";
import { orderService } from "../services/orderService";
import { productService } from "../services/productService";
import { favoritesService } from "../services/favoritesService";
import { formatBRL } from "../utils/format";

export default defineComponent({
  name: "ProfileDashboardView",

  data() {
    return {
      users: 0,
      localProducts: 0,
      localFavorites: 0,
      totalDelivered: 0,
      summary: { orders: 0, revenue: 0, itemsSold: 0 },
      statusDeliveredLabel: "Pendente",
    };
  },

  async mounted() {
    const auth = useAuthStore();
    const user = auth.user;
  
    if (!user) return;
    
    const orders = await orderService.listForUser(user.id);
    
    this.users = auth.usersCount;
    this.localProducts = productService.listLocal().length;
    this.summary = await orderService.summary();

    if (user) {

    this.localFavorites = user
      ? favoritesService.list(user.id).length
      : 0;

      this.totalDelivered = orders.filter(
        (o) => o.status === "delivered" || 
               o.status === "shipped" || 
               o.status === "paid" || 
               o.status === "awaiting_payment"
      ).length;

      if (orders.length === 0) {
    this.statusDeliveredLabel = "Sem pedidos";
    return;
  }

  const lastOrder = orders[0];

  const map: Record<string, string> = {
    awaiting_payment: "Pendente",
    paid: "Pago",
    shipped: "Enviado",
    delivered: "Entregue",
    cancelled: "Cancelado",
  };

  this.statusDeliveredLabel = map[lastOrder.status] ?? "Pendente";
    
    }

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
        <template #title>Pedidos</template>
        <template #content>
          <p class="text-3xl font-bold m-0">{{ summary.orders }}</p>
        </template>
      </Card>
      <Card class="transition-colors! bg-gray-200! dark:bg-gray-900! text-gray-900! dark:text-gray-100! border-gray-300! dark:border-gray-700!">
  <template #title>Lista de Desejos</template>
  <template #content>
    <p class="text-3xl font-bold m-0">{{ localFavorites }}</p>
  </template>
      </Card>
      <Card class="transition-colors! bg-gray-200! dark:bg-gray-900! text-gray-900! dark:text-gray-100! border-gray-300! dark:border-gray-700!">
        <template #title>Entregas <span class="text-sm">({{ statusDeliveredLabel }})</span></template>
  <template #content>
    <p class="text-3xl font-bold m-0">{{ totalDelivered }}</p>
  </template>
      </Card>
      <Card class="transition-colors! bg-gray-200! dark:bg-gray-900! text-gray-900! dark:text-gray-100! border-gray-300! dark:border-gray-700!">
        <template #title>Valor Total <span class="text-sm">(Pedidos)</span></template>
        <template #content>
          <p class="text-2xl font-bold m-0">{{ formatBRL(summary.revenue) }}</p>
        </template>
      </Card>
    </div>

    <div class="flex flex-wrap gap-2">
      <Button label="Editar Dados" icon="pi pi-user-edit" outlined @click="$router.push({ name: 'profile-edit' })" />
      <Button label="Meus Pedidos" icon="pi pi-shopping-bag" outlined @click="$router.push({ name: 'profile-orders' })" />
      <Button label="Lista de Desejos" icon="pi pi-cog" outlined @click="$router.push({ name: 'profile-favorites' })" />
      <Button label="Acompanhar Entrega" icon="pi pi-truck" outlined @click="$router.push({ name: 'profile-tracking' })" />
    </div>

    <Message severity="info" :closable="false">
      Use o menu lateral para navegar pelo seu painel, editar seus dados, acompanhar seus pedidos, visualizar sua lista de desejos e acompanhar suas entregas em tempo real.
    </Message>
  </div>
</template>
