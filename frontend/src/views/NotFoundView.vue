<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "NotFoundView",
});
</script>

<template>
  <section class="max-w-lg mx-auto text-center space-y-4 py-16">
    <h1 class="text-4xl font-bold m-0">404</h1>
    <p class="m-0 text-gray-600 dark:text-gray-400">Página não encontrada.</p>
    <Button label="Voltar ao início" icon="pi pi-home" @click="$router.push('/')" />
  </section>
</template>
