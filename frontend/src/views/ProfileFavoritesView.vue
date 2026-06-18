<script lang="ts">
import { defineComponent } from "vue";
import { useAuthStore } from "../stores/auth";
import { favoritesService } from "../services/favoritesService";
import { productService } from "../services/productService";
import { Product } from "@shared/models/Product";
import { formatBRL } from "../utils/format";
import { cartService } from "../services/cartService";
import ProductCard from "../components/ProductCard.vue";

export default defineComponent({
  name: "ProfileFavoritesView",

  components: { ProductCard },

  data() {
    return {
      products: [] as Product[],
      loading: true,
      favTick: 0,
    };
  },

  computed: {
    ids(): number[] {
      const auth = useAuthStore();
      const u = auth.user;
      if (!u) return [];
      this.favTick;
      return favoritesService.list(u.id);
    },
  },

  watch: {
    ids: {
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
      const auth = useAuthStore();
      const u = auth.user;
      if (!u) {
        this.products = [];
        this.loading = false;
        return;
      }
      const list: Product[] = [];
      for (const id of favoritesService.list(u.id)) {
        const p = await productService.getById(id);
        if (p) list.push(p);
      }
      this.products = list;
      this.loading = false;
    },
    addToCart(product: Product): void {
      cartService.addItem(product, 1);
      this.$toast.add({
        severity: "success",
        summary: "Adicionado",
        detail: product.name,
        life: 2500,
      });
    },
    removeFavorite(productId: number): void {
      const auth = useAuthStore();
      const u = auth.user;
      if (!u) return;
      favoritesService.remove(u.id, productId);
      this.favTick += 1;
      void this.load();
    },
  },
});
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-bold m-0">Favoritos</h1>
    <p class="m-0 text-sm text-gray-600 dark:text-gray-400">
      Produtos salvos apenas na sua conta (localStorage).
    </p>
    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Skeleton v-for="n in 4" :key="n" height="12rem" class="rounded-lg" />
    </div>
    <div v-else-if="products.length === 0" class="text-sm text-gray-600 dark:text-gray-400">
      Nenhum favorito ainda. Use o coração na página do produto.
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="p in products" :key="p.id" class="relative">
        <Button
          icon="pi pi-times"
          severity="danger"
          text
          rounded
          class="absolute! right-2 top-2 z-10"
          aria-label="Remover dos favoritos"
          @click="removeFavorite(p.id)"
        />
        <ProductCard
          :product="p"
          :formatted-price="formatBRL(p.price)"
          @add-to-cart="addToCart(p)"
        />
      </div>
    </div>
  </div>
</template>
