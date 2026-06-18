<script lang="ts">
import { defineComponent } from "vue";
import { CartItem } from "@shared/models/CartItem";
import { cartService } from "../services/cartService";
import EmptyCart from "../components/EmptyCart.vue";
import { formatBRL } from "../utils/format";

export default defineComponent({
  name: "CartView",

  components: { EmptyCart },

  props: {
    id: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      loading: true,
      cartTick: 0,
      unsubscribe: null as null | (() => void),
      qtyBtnCls:
        "bg-transparent! w-5! [&_svg]:w-5! [&_svg]:h-3.5! [&_.pi]:hover:text-gray-800 dark:[&_.pi]:hover:text-gray-100 pt-[0.24rem]! [&_.pi]:text-[0.6rem]! [&_.pi]:font-bold! focus:outline-none! focus:shadow-none!",

      home: { label: "Início", to: "/" },
      items: [] as Array<{ label: string; to?: string }>,
    };
  },

  computed: {
    cartItems(): CartItem[] {
      this.cartTick;
      return cartService.getItems();
    },
    total(): number {
      this.cartTick;
      return cartService.getFinalPrice();
    },
    totalItems(): number {
      this.cartTick;
      return cartService.getTotalItems();
    },
  },

  mounted() {
    this.unsubscribe = cartService.subscribe(() => {
      this.cartTick += 1;
    });
  },

  beforeUnmount() {
    this.unsubscribe?.();
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
      this.items = [
        { label: "Produtos", to: "/products" },
        { label: "Carrinho", to: "/cart" },
      ];
    },
    setQuantity(itemId: string, quantity: number): void {
      cartService.setQuantity(itemId, quantity);
    },
    decreaseQuantity(itemId: string): void {
      cartService.decreaseQuantity(itemId);
    },
    removeItem(itemId: string): void {
      cartService.removeItem(itemId);
    },
    confirmRemoveItem(itemId: string, productName: string): void {
      this.$confirm.require({
        message: productName,
        header: "Confirmação",
        icon: "pi pi-exclamation-triangle",
        accept: () => this.removeItem(itemId),
        reject: () => {},
        rejectProps: {
          label: "Cancelar",
          severity: "secondary",
          icon: "pi pi-times",
          outlined: true,
          class:
            "bg-blue-500! hover:bg-blue-700! text-gray-100! [&_span]:font-normal! border-none! py-[0.4rem]!",
        },
        acceptProps: {
          label: "Sim, excluir",
          severity: "danger",
          icon: "pi pi-check",
          class:
            "bg-red-500! hover:bg-red-700! text-gray-100! [&_span]:font-normal! border-none! py-[0.4rem]!",
        },
      });
    },
    onQtyUpdate(item: CartItem, value: number | null): void {
      if (value === null || value === undefined) return;
      if (value === 0) {
        this.confirmRemoveItem(item.itemId ?? String(item.product.id), item.product.name);
        this.$nextTick(() => {
          item.quantity = 1;
        });
        return;
      }
      this.setQuantity(item.itemId ?? String(item.product.id), value);
    },
    goCheckout(): void {
      this.$router.push({ name: "checkout" });
    },
  },
});
</script>

<template>
  <section class="space-y-4">
    <h1 class="text-xl sm:text-2xl font-bold mb-3">Carrinho</h1>

    <AppBreadcrumb :home="home" :items="items" />
    <aside
      class="rounded-lg overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
    >
      <div class="p-4 sm:p-5">
        <EmptyCart v-if="cartItems.length === 0" />

        <div v-else class="space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p class="m-0 text-gray-600 dark:text-gray-400">
                <strong>Total de itens:</strong> {{ totalItems }}
              </p>
              <p class="m-0 mt-1 text-gray-600 dark:text-gray-400">
                <strong>Valor total:</strong> {{ formatBRL(total) }}
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <Button label="Continuar comprando" severity="secondary" outlined @click="$router.push('/products')" />
              <Button label="Finalizar compra" icon="pi pi-check" @click="goCheckout" />
            </div>
          </div>

          <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h2 class="font-medium mb-2 m-0">Itens no carrinho</h2>

            <DataView
              :value="cartItems"
              layout="list"
              class="w-full bg-transparent! [&_div.p-dataview-content]:bg-transparent!"
            >
              <template #list="slotProps">
                <div
                  v-for="item in slotProps.items"
                  :key="item.itemId ?? item.product.id"
                  class="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 py-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
                >
                  <div class="flex items-start gap-3 flex-1 min-w-0">
                    <img
                      :src="item.product.mainImage || item.product.thumbnail || 'https://via.placeholder.com/160x160?text=Sem+imagem'"
                      alt=""
                      class="w-16 h-16 object-contain rounded border border-gray-200 dark:border-gray-700 bg-white"
                    />
                    <div class="min-w-0">
                      <RouterLink
                        class="font-medium text-gray-800 dark:text-gray-200 no-underline hover:underline block truncate"
                        :to="{ name: 'product-detail', params: { slug: item.product.slug || String(item.product.id) } }"
                      >
                        {{ item.product.name }}
                      </RouterLink>
                      <p class="m-0 text-sm text-gray-600 dark:text-gray-400">
                        {{ item.product.category.title }}
                      </p>
                      <p v-if="item.variantNote" class="m-0 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {{ item.variantNote }}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 sm:justify-end w-full sm:w-auto">
                    <span class="text-emerald-700 dark:text-emerald-400 font-semibold w-full sm:w-28 text-left sm:text-right">
                      {{ formatBRL(item.product.price * item.quantity) }}
                    </span>
                    <InputNumber
                      :model-value="item.quantity"
                      :min="0"
                      show-buttons
                      buttons-class="bg-transparent! w-5!"
                      :increment-button-class="qtyBtnCls"
                      :decrement-button-class="qtyBtnCls"
                      increment-button-icon="pi pi-plus"
                      decrement-button-icon="pi pi-minus"
                      :input-class="`
                        ${item.quantity >= 100 ? 'w-14!' : item.quantity >= 10 ? 'w-12!' : 'w-10!'}
                        bg-transparent!
                        text-sm
                        text-gray-700!
                        dark:text-gray-400!
                        py-[0.15rem]! 
                        p-2!
                        pointer-events-none
                        border-[0.12rem]!
                        border-gray-300!
                        dark:border-gray-600!
                      `"
                      @update:model-value="(v) => onQtyUpdate(item, v as number)"
                    />
                    <Button
                      icon="pi pi-trash"
                      severity="danger"
                      text
                      rounded
                      aria-label="Excluir item"
                      class="w-6!"
                      @click="confirmRemoveItem(item.itemId ?? String(item.product.id), item.product.name)"
                    />
                  </div>
                </div>
              </template>
            </DataView>
          </div>
        </div>
      </div>
    </aside>
  </section>
</template>
