<script lang="ts">
import { defineComponent } from "vue";
import { Product } from "@shared/models/Product";
import { productService } from "../services/productService";
import { cartService } from "../services/cartService";
import { formatBRL } from "../utils/format";
import ProductCard from "../components/ProductCard.vue";

const PAGE = 20;

export default defineComponent({
  name: "ProductsView",

  components: { ProductCard },

  data() {
    return {
      products: [] as Product[],
      categories: [] as { slug: string; name: string }[],
      loading: true,
      loadingMore: false,
      error: "" as string,
      selectedSlug: "" as string,
      apiSkip: 0,
      apiTotal: 0,
      observer: null as IntersectionObserver | null,
      home: { label: "Início", to: "/" },
    };
  },

  computed: {
    hasMore(): boolean {
      return this.apiSkip < this.apiTotal;
    },

    breadcrumbItems(): { label: string; to: string }[] {
      //const rawCategory = this.$route.query.category;
      const rawCategory = this.$route.params.category

      const category =
        typeof rawCategory === "string"
          ? rawCategory
          : Array.isArray(rawCategory)
            ? rawCategory[0]
            : undefined;

      const base = [{ label: "Produtos", to: "/products" }];

      const extra =
        category
          ? [{
            label: this.categories.find((c) => c.slug === category)?.name || category,
            to: `/products?category=${category}`
          }]
          : [];

      return [...base, ...extra];

    },
    titleProductsCategory(): string {
      const rawCategory = this.$route.query.category;

      const category =
        typeof rawCategory === "string"
          ? rawCategory
          : Array.isArray(rawCategory)
            ? rawCategory[0]
            : undefined;

      const title =
        category
          ? this.categories.find((c) => c.slug === category)?.name || category
          : "Produtos";

      return title;

    },

  },
  watch: {
    //"$route.query.category"(val: string | string[] | undefined) {
    "$route.params.category"(val: string | string[] | undefined) {
      const slug = typeof val === "string" ? val : "";
      void this.resetAndLoad(slug);
    },
  },

  async mounted() {
    try {
      this.categories = await productService.fetchCategories();
      const slug = this.$route.params.category as string || "";
      // const slug =
      //   typeof this.$route.query.category === "string" ? this.$route.query.category : "";
      await this.resetAndLoad(slug);
      this.$nextTick(() => this.setupObserver());
    } catch {
      this.error = "Não foi possível carregar os dados.";
      this.loading = false;
    }
  },

  beforeUnmount() {
    this.observer?.disconnect();
  },

  methods: {
    formatBRL,
    setupObserver(): void {
      const el = this.$refs.sentinel as HTMLElement | undefined;
      if (!el) return;
      this.observer?.disconnect();
      this.observer = new IntersectionObserver(
        (entries) => {
          const hit = entries.some((e) => e.isIntersecting);
          if (hit) void this.loadMore();
        },
        { root: null, rootMargin: "200px", threshold: 0 }
      );
      this.observer.observe(el);
    },
    async resetAndLoad(slug: string): Promise<void> {
      this.loading = true;
      this.error = "";
      this.selectedSlug = slug;
      this.apiSkip = 0;
      this.apiTotal = 0;
      this.products = [];
      try {
        const res = await productService.fetchPage({
          limit: PAGE,
          skip: 0,
          categorySlug: slug || undefined,
        });
        const page = productService.mergePage(res.products, slug, true);
        const seen = new Set<number>();
        this.products = page.filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
        this.apiSkip = res.products.length;
        this.apiTotal = res.total;
      } catch {
        this.error = "Falha ao carregar produtos.";
      } finally {
        this.loading = false;
        this.$nextTick(() => this.setupObserver());
      }
    },
    async loadMore(): Promise<void> {
      if (this.loading || this.loadingMore || !this.hasMore) return;
      this.loadingMore = true;
      try {
        const res = await productService.fetchPage({
          limit: PAGE,
          skip: this.apiSkip,
          categorySlug: this.selectedSlug || undefined,
        });
        if (res.products.length === 0) {
          this.apiTotal = this.apiSkip;
          return;
        }
        const page = productService.mergePage(res.products, this.selectedSlug, false);
        const seen = new Set(this.products.map((p) => p.id));
        page.forEach((p) => {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            this.products.push(p);
          }
        });
        this.apiSkip += res.products.length;
        this.apiTotal = res.total;
      } catch {
        this.$toast.add({
          severity: "error",
          summary: "Listagem",
          detail: "Não foi possível carregar mais produtos.",
          life: 3000,
        });
      } finally {
        this.loadingMore = false;
      }
    },
    async onCategoryChange(slug: string): Promise<void> {
      await this.$router.replace({
        //query: slug ? { category: slug } : {},
        path: slug ? `/products/${slug}` : "/products",
      });
    },
    addToCart(product: Product): void {
      cartService.addItem(product, 1);
      this.$toast.add({
        severity: "success",
        summary: "Adicionado",
        detail: `Produto <strong>"${product.name}"</strong> foi adicionado ao carrinho`,
        life: 3000,
        closable: false,
      });
    },
  },
});
</script>

<template>
  <section class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold m-0">{{ titleProductsCategory }}</h1>
        <p class="my-2 text-sm text-gray-600 dark:text-gray-400">
          Filtre por categoria e role a página para carregar mais automaticamente.
        </p>
        <AppBreadcrumb :home="home" :items="breadcrumbItems" />
      </div>
      <div class="flex flex-col-2 items-center gap-1 md:max-w-md">
        <label class="text-base font-medium text-gray-600 dark:text-gray-400" for="cat">Categoria</label>
        <select id="cat"
          class="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
          :value="selectedSlug" @change="onCategoryChange(($event.target as HTMLSelectElement).value)">
          <option value="">Todas</option>
          <option v-for="c in categories" :key="c.slug" :value="c.slug">
            {{ c.name }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Skeleton v-for="n in 8" :key="n" height="12rem" class="rounded-lg" />
    </div>

    <Message v-else-if="error" severity="error" :closable="false">{{ error }}</Message>

    <div v-else-if="products.length === 0" class="text-center py-8 text-gray-600 dark:text-gray-400">
      Nenhum produto encontrado para esta seleção.
    </div>

    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ProductCard v-for="product in products" :key="product.id" :product="product"
          :formatted-price="formatBRL(product.price)" @add-to-cart="addToCart(product)" />
      </div>
      <div ref="sentinel" class="h-4 w-full" aria-hidden="true" />
      <p v-if="loadingMore" class="text-center text-sm text-gray-600 dark:text-gray-400 py-4 m-0">
        Carregando mais produtos...
      </p>
      <p v-else-if="!hasMore && products.length > 0"
        class="text-center text-xs text-gray-500 dark:text-gray-500 py-4 m-0">
        Fim da listagem
      </p>
    </div>
  </section>
</template>
