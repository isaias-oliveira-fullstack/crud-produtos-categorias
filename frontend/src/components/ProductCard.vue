<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { Product } from "@shared/models/Product";

export default defineComponent({
  name: "ProductCard",

  props: {
    product: {
      type: Object as PropType<Product>,
      required: true,
    },
    formattedPrice: {
      type: String,
      required: true,
    },
    detailLinkLabel: {
      type: String,
      default: "Ver detalhes",
    },
    addToCartLabel: {
      type: String,
      default: "Adicionar",
    },
    showCategoryLine: {
      type: Boolean,
      default: true,
    },
  },

  emits: ["add-to-cart"],
});
</script>

<template>
  <Card
    class="p-4! [&_div]:p-0! rounded-lg overflow-hidden shadow-lg bg-gray-100! dark:bg-gray-800! border border-gray-200 dark:border-gray-700 flex flex-col gap-2 h-full"
  >
    <template #title>
      <div class="mb-3 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-white/40">
        <img
          :src="product.mainImage || product.thumbnail || 'https://via.placeholder.com/400x300?text=Sem+imagem'"
          :alt="product.name || 'Produto'"
          class="w-full h-36 object-contain bg-white"
          loading="lazy"
        />
      </div>
      <RouterLink
        :to="{ name: 'product-detail', params: { slug: product.slug || String(product.id) } }"
        class="block max-w-full text-[1.1rem] font-bold text-gray-600 dark:text-gray-100 overflow-hidden text-ellipsis whitespace-nowrap no-underline"
      >
        {{ product.name }}
      </RouterLink>
    </template>
    <template #content>
      <p class="text-emerald-700 dark:text-emerald-400 font-semibold mb-2 leading-[1.1]">
        {{ formattedPrice }}
      </p>
      <p v-if="showCategoryLine" class="text-gray-600 dark:text-gray-400 text-sm m-0">
        {{ product.category.title }}
      </p>

      <p v-if="product.brand" class="text-sm text-gray-500 dark:text-gray-400 m-0 hidden">
        Marca: {{ product.brand }}
      </p>

      <p v-if="product.description" class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed m-0 mt-2 line-clamp-3 hidden">
        {{ product.description }}
      </p>

      <p v-if="product.stock !== undefined" class="text-xs text-gray-500 dark:text-gray-400 mt-2 m-0 hidden">
        Estoque: {{ product.stock }}
      </p>
      <div class="mt-3 flex flex-col gap-2">
        <RouterLink
          :to="{ name: 'product-detail', params: { slug: product.slug || String(product.id) } }"
          class="text-sm text-blue-700 dark:text-blue-300 no-underline hover:underline"
        >
          {{ detailLinkLabel }}
        </RouterLink>
        <Button
          :label="addToCartLabel"
          icon="pi pi-cart-plus"
          class="p-button p-component py-2 px-5 inline-block font-semibold tracking-wide align-middle transition duration-500 text-base text-center bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/50"
          @click="$emit('add-to-cart')"
        />
      </div>
    </template>
  </Card>
</template>