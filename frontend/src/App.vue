<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
});
</script>

<template>
  <div class="min-h-screen">
    <ConfirmDialog
      class="
        bg-gray-100!
        dark:bg-gray-800! 
        border!
        border-gray-200!
        dark:border-gray-700!
        text-gray-900! 
        dark:text-gray-100!
        m-4!
        md:mx-0!
        [&_.p-dialog-close-button]:hover:bg-gray-200! 
        [&_.p-dialog-close-button]:hover:dark:bg-gray-900!
        [&_.p-confirmdialog-icon]:text-gray-900! 
        dark:[&_.p-confirmdialog-icon]:text-gray-100!
        [&_.p-dialog-header]:py-3!
        [&_.p-dialog-content]:pb-6!
      "
    >
      <template #message="slotProps">
        <div class="flex items-center gap-2">
          <i class="pi pi-exclamation-triangle text-yellow-500 text-xl"></i>
          <span>
            Deseja mesmo excluir
            <span class="font-bold">"{{ slotProps.message.message }}"</span>
            do carrinho?
          </span>
        </div>
      </template>
    </ConfirmDialog>

    <Toast
      position="top-right"
      class="
        w-80!
        [&_.p-toast]:right-2!
        [&_.p-toast]:top-2!
        [&_.p-toast-message]:bg-gray-100!
        dark:[&_.p-toast-message]:bg-gray-800!
        [&_.p-toast-message]:shadow-lg!
        [&_.p-toast-message]:rounded-lg!
        [&_.p-toast-message]:border-gray-200!
        [&_.p-toast-message]:dark:border-gray-700!
      "
    >
      <template #message="slotProps">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <i class="pi pi-check font-semibold text-emerald-600 text-xl"></i>
            <span class="p-toast-summary font-semibold text-gray-900! dark:text-gray-100!">
              {{ slotProps.message.summary }}
            </span>
          </div>
          <span 
            class="p-toast-detail text-gray-600! dark:text-gray-300! text-sm"
            v-html="slotProps.message.detail"
          />
        </div>
      </template>
    </Toast>

    <router-view />
  </div>
</template>
