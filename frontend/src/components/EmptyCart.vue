<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "EmptyCart",
});
</script>

<template>
  <Card class="
      p-2 
      text-center 
      bg-gray-200! 
      dark:bg-gray-900! 
      text-gray-600! 
      dark:text-gray-400! 
      border-gray-600!
      dark:border-gray-400! 
      shadow-none 
      border 
      border-dashed">
    <template #content>
      <i class="pi pi-shopping-cart text-xl! mb-1 block" />
      <h2 class="m-0 text-base font-semibold">Seu carrinho está vazio.</h2>
      <p class="m-0 mt-1 text-sm">Adicione produtos pela vitrine ou pela listagem.</p>
      <RouterLink to="/products"
        class="inline-block mt-3 text-sm text-blue-700 dark:text-blue-300 font-medium no-underline hover:underline">
        Ver produtos
      </RouterLink>
    </template>
  </Card>
</template>
