<script lang="ts">
import { defineComponent } from "vue";
import type { Product } from "@shared/models/Product";
import { productService } from "../services/productService";
import { cartService } from "../services/cartService";
import ProductCard from "../components/ProductCard.vue";
import { formatBRL } from "../utils/format";

export default defineComponent({
  name: "HomeView",

  components: { ProductCard },

  data() {
    return {
      products: [] as Product[],
      loading: true,
      error: "" as string,
    };
  },

  async mounted() {
    try {
      const { products } = await productService.fetchPage({ limit: 8, skip: 0 });
      this.products = productService.getMergedCatalog(products);
    } catch (e) {
      this.error = "Não foi possível carregar os produtos.";
    } finally {
      this.loading = false;
    }
  },

  methods: {
    formatBRL,
    addToCart(product: Product): void {
      cartService.addItem(product, 1);
      this.$toast.add({
        severity: "success",
        summary: "Adicionado",
        detail: product.name,
        life: 3000,
        closable: false,
      });
    },
  },
});
</script>

<template>
  <section class="space-y-6">
    <div class="rounded-lg border border-gray-300 dark:border-gray-700 bg-linear-to-r from-blue-600/10 to-emerald-600/10 dark:from-blue-500/15 dark:to-emerald-500/10 p-6 sm:p-8">
      <h1 class="text-2xl sm:text-3xl font-bold m-0 mb-2">Bem-vindo ao CRUD Products Categories Store</h1>
      <p class="m-0 text-gray-700 dark:text-gray-300 max-w-2xl">
        Arquitetura em camadas com controllers tipados, validação robusta via Zod e autenticação centralizada para máxima segurança.
      </p>
      <div class="mt-4 flex flex-wrap gap-2">
        <Button
          label="Ver todas as categorias"
          icon="pi pi-th-large"
          icon-pos="right"
          @click="$router.push('/products')"
        />
        <Button
          label="Ir ao carrinho"
          severity="secondary"
          outlined
          icon="pi pi-shopping-cart"
          @click="$router.push('/cart')"
        />
      </div>
    </div>

    <div>
      <h2 class="text-[1.2rem] font-bold mb-3">Destaques</h2>

      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton v-for="n in 4" :key="n" height="12rem" class="rounded-lg" />
      </div>

      <Message v-else-if="error" severity="error" :closable="false">{{ error }}</Message>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          :formatted-price="formatBRL(product.price)"
          @add-to-cart="addToCart(product)"
        />
      </div>
    </div>
  </section>
</template>
