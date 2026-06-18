<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "AppBreadcrumb",
  props: {
    home: {
      type: Object as PropType<{ icon: string; to: string }>,
      required: true,
    },
    items: {
      type: Array as PropType<Array<{ label: string; to: string; url: string }>>,
      required: true,
    },
  },
});
</script>

<template>
  <Breadcrumb :home="home" :model="items"
    class="bg-transparent! p-0! [&_.p-breadcrumb-item-link]:text-gray-600! dark:[&_.p-breadcrumb-item-link]:text-gray-400! [&_.p-breadcrumb-item-link]:hover:text-gray-900! dark:[&_.p-breadcrumb-item-link]:hover:text-gray-100!">
    <template #item="{ item, props }">
      <router-link v-if="item.to" v-slot="{ href, navigate }" :to="item.to" custom>
        <a :href="href" v-bind="props.action" @click="navigate">
          <span class="text-gray-600! dark:text-gray-400! hover:text-gray-900! dark:hover:text-gray-100! font-medium"
            v-html="item.label" />
        </a>
      </router-link>

      <a v-else :href="item.url" :target="item.target" v-bind="props.action">
        <span class="text-gray-600! dark:text-gray-400! hover:text-gray-900! dark:hover:text-gray-100! font-medium"
          v-html="item.label" />
      </a>
    </template>
    <template #separator> / </template>
  </Breadcrumb>
</template>