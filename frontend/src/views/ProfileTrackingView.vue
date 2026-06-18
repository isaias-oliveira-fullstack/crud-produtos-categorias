<script lang="ts">
import { defineComponent } from "vue";
import { useAuthStore } from "../stores/auth";
import { orderService } from "../services/orderService";
import { Order } from "@shared/models/Order";
import { orderStatusLabel } from "../utils/orderLabels";
import { formatBRL } from "../utils/format";

export default defineComponent({
  name: "ProfileTrackingView",

  data() {
    return {
      orders: [] as Order[],
      selectedId: "" as string,
      steps: [
        { key: "awaiting_payment", label: "Aguardando pagamento" },
        { key: "paid", label: "Pagamento confirmado" },
        { key: "shipped", label: "Enviado" },
        { key: "delivered", label: "Entregue" },
      ],
    };
  },

  computed: {
    selected(): Order | null {
      return this.orders.find((o) => o.id === this.selectedId) ?? null;
    },
    stepIndex(): number {
      if (!this.selected) return -1;
      const order = this.selected.status;
      if (order === "cancelled") return -1;
      const map: Record<string, number> = {
        awaiting_payment: 0,
        paid: 1,
        shipped: 2,
        delivered: 3,
      };
      return map[order] ?? 0;
    },
  },

  async mounted() {
    const auth = useAuthStore();
    const u = auth.user;
    if (!u) return;
    this.orders = await orderService.listForUser(u.id);
    if (this.orders.length > 0) {
      this.selectedId = this.orders[0].id;
    }
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
  },
});
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-bold m-0">Acompanhar entrega</h1>
    <p class="m-0 text-sm text-gray-600 dark:text-gray-400">
      Simulação de etapas com base no status do pedido.
    </p>

    <div v-if="orders.length === 0" class="text-sm text-gray-600 dark:text-gray-400">
      Nenhum pedido para acompanhar.
    </div>

    <template v-else>
      <div class="max-w-md">
        <label class="text-xs font-medium text-gray-600 dark:text-gray-400" for="ord">Pedido</label>
        <select
          id="ord"
          v-model="selectedId"
          class="mt-1 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
        >
          <option v-for="o in orders" :key="o.id" :value="o.id">
            {{ o.id }} — {{ formatBRL(o.total) }} — {{ orderStatusLabel(o.status) }}
          </option>
        </select>
      </div>

      <Card v-if="selected" class="bg-gray-100! dark:bg-gray-800! border border-gray-200 dark:border-gray-700">
        <template #title>
          Pedido {{ selected.id }}
        </template>
        <template #content>
          <p class="text-sm m-0 mb-4 text-gray-600 dark:text-gray-400">
            Atualizado em {{ formatDate(selected.createdAt) }} · Total {{ formatBRL(selected.total) }}
          </p>
          <div v-if="selected.status === 'cancelled'" class="text-amber-700 dark:text-amber-300 text-sm">
            Este pedido foi cancelado.
          </div>
          <ol v-else class="space-y-3 m-0 p-0 list-none">
            <li
              v-for="(step, idx) in steps"
              :key="step.key"
              class="flex gap-3 items-start"
            >
              <span
                class="mt-0.5 inline-flex w-8 h-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                :class="
                  idx <= stepIndex
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                "
              >
                {{ idx + 1 }}
              </span>
              <div>
                <p class="m-0 font-medium">{{ step.label }}</p>
                <p v-if="idx === stepIndex" class="m-0 text-xs text-emerald-700 dark:text-emerald-300">
                  Etapa atual
                </p>
              </div>
            </li>
          </ol>
        </template>
      </Card>
    </template>
  </div>
</template>
