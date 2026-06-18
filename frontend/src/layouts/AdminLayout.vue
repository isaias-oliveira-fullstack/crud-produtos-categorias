<script lang="ts">
import { defineComponent } from "vue";
import { useAuthStore } from "../stores/auth";

export default defineComponent({
  name: "AdminLayout",

  data() {
    return {
      darkMode: false,
      mobileMenuOpen: false,
    };
  },

  computed: {
    crumb(): string {
      if (this.$route.name === "admin-dashboard") return "Painel";
      if (this.$route.name === "admin-products") return "Produtos";
      if (this.$route.name === "admin-categories") return "Categorias";
      if (this.$route.name === "admin-reports") return "Relatórios";
      if (this.$route.name === "admin-users") return "Usuários";
      if (this.$route.name === "admin-orders") return "Pedidos";
      if (this.$route.name === "admin-settings") return "Configurações";
      return "";
    },
    user() {
      return useAuthStore().user;
    },
    firstName() {
      if (!this.user || !this.user.name) return '';
      return this.user.name.trim().split(' ').slice(0, 2).join(' ');
    },
    userRoleLabel() {
      return useAuthStore().isAdmin ? 'Administrador' : 'Cliente';
    },
  },

  mounted() {
    if (this.darkMode) document.documentElement.classList.add("dark");
  },

  methods: {
    toggleDarkMode(): void {
      this.darkMode = !this.darkMode;
      if (this.darkMode) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    },
    logout(): void {
      useAuthStore().logout();
      this.$toast.add({
        severity: "info",
        summary: "Sessão encerrada",
        detail: "Até logo!",
        life: 2500,
      });
      this.$router.replace({ name: "login" });
    }
  },
});
</script>

<template>
  <div class="min-h-screen bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <div class="max-w-330 mx-auto flex flex-col lg:flex-row gap-4 px-3 sm:px-6 py-3 sm:py-5">
      <div
        class="flex lg:hidden items-center justify-between gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-2 shadow-sm"
      >
        <RouterLink
          to="/admin"
          class="font-bold text-base sm:text-lg no-underline text-gray-900 dark:text-gray-100 truncate min-w-0"
        >
          Painel Admin
        </RouterLink>
        <div class="flex items-center gap-1 shrink-0">
          <Button
            :icon="darkMode ? 'pi pi-moon' : 'pi pi-sun'"
            text
            rounded
            class="w-9! h-8! border! border-gray-700! dark:border-gray-300!"
            :aria-label="darkMode ? 'Modo claro' : 'Modo escuro'"
            @click="toggleDarkMode"
          />
          <Button
            icon="pi pi-bars"
            text
            rounded
            class="w-9! h-8!"
            aria-label="Abrir menu"
            :aria-expanded="mobileMenuOpen"
            @click="mobileMenuOpen = true"
          />
        </div>
      </div>

      <aside
        class="hidden lg:flex lg:flex-col lg:w-64 shrink-0 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-4 shadow-sm"
      ><div 
            v-if="user"
            class="relative overflow-hidden w-full border-0 bg-transparent flex items-center justify-between gap-2 mb-4">
             <div class="flex items-center justify-between gap-2">       
                    <Avatar image="https://primefaces.org/cdn/primevue/images/organization/walter.jpg" class="mr-2" shape="circle" />
                    <span class="inline-flex flex-col items-start text-gray-800! dark:text-gray-200!">
                        <span class="text-sm font-bold">Olá, {{ firstName }}</span>
                        <span class="text-sm">{{ userRoleLabel }}</span>
                    </span>
                  </div>
          <Button
            :icon="darkMode ? 'pi pi-moon' : 'pi pi-sun'"
            text
            rounded
            class="w-9! h-8! border! border-gray-700! dark:border-gray-300!"
            :aria-label="darkMode ? 'Modo claro' : 'Modo escuro'"
            @click="toggleDarkMode"
          />
                  </div>
        <div class="flex items-center justify-between gap-2 mb-4">
          <RouterLink
            to="/admin/dashboard"
            class="font-bold text-lg no-underline text-gray-900 dark:text-gray-100"
          >
            Painel Admin
          </RouterLink>
        </div>
        <nav class="flex flex-col gap-1 text-sm" aria-label="Administração">
          <RouterLink
            class="px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 no-underline text-gray-800 dark:text-gray-200"
            active-class="!bg-blue-600/20 !font-semibold"
            to="/admin/dashboard"
          >
            <i class="pi pi-objects-column" aria-hidden="true" />
            Painel
          </RouterLink>
          <RouterLink
            class="px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 no-underline text-gray-800 dark:text-gray-200"
            active-class="!bg-blue-600/20 !font-semibold"
            to="/admin/products"
          >
            <i class="pi pi-box" aria-hidden="true" />  
            Produtos
          </RouterLink>
          <RouterLink
            class="px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 no-underline text-gray-800 dark:text-gray-200"
            active-class="!bg-blue-600/20 !font-semibold"
            to="/admin/categories"
          >
            <i class="pi pi-bars" aria-hidden="true" /> 
            Categorias
          </RouterLink>
          <RouterLink
            class="px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 no-underline text-gray-800 dark:text-gray-200"
            active-class="!bg-blue-600/20 !font-semibold"
            to="/admin/reports"
          >
            <i class="pi pi-chart-bar" aria-hidden="true" />  
            Relatórios
          </RouterLink>
          <RouterLink
            class="px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 no-underline text-gray-800 dark:text-gray-200"
            active-class="!bg-blue-600/20 !font-semibold"
            to="/admin/users"
          >
            <i class="pi pi-user" aria-hidden="true" />  
            Usuários
          </RouterLink>
          <RouterLink
            class="px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 no-underline text-gray-800 dark:text-gray-200"
            active-class="!bg-blue-600/20 !font-semibold"
            to="/admin/orders"
          > 
            <i class="pi pi-shopping-bag" aria-hidden="true" /> 
            Pedidos
          </RouterLink>
          <RouterLink
            class="px-3 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 no-underline text-gray-800 dark:text-gray-200"
            active-class="!bg-blue-600/20 !font-semibold"
            to="/admin/settings"
          >
            <i class="pi pi-cog" aria-hidden="true" />
            Configurações
          </RouterLink>
          <button
              type="button"
              class="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left w-full text-red-700 dark:text-red-300 hover:bg-red-100/50 dark:hover:bg-red-900/30 border-0 bg-transparent cursor-pointer"
              @click="logout"
            >
              <i class="pi pi-sign-out" aria-hidden="true" />
              Sair
            </button>
          <RouterLink
            class="px-3 py-2 rounded-md hover:bg-amber-200/50 dark:hover:bg-amber-900/30 no-underline text-amber-900 dark:text-amber-100 mt-2"
            to="/"
          >
            ← Voltar à loja
          </RouterLink>
        </nav>
      </aside>

      <Dialog
        v-model:visible="mobileMenuOpen"
        modal
        header="Menu"
        class="
        w-[min(100vw-2rem,22rem)]
        transition-colors! 
        bg-gray-200! 
        dark:bg-gray-900! 
        text-gray-900! 
        dark:text-gray-100! 
        border-gray-300! 
        dark:border-gray-700!
        "
        :dismissable-mask="true"
        :breakpoints="{ '960px': '90vw' }"
      >
        <nav class="flex flex-col gap-1 text-sm" aria-label="Administração (mobile)">
          <RouterLink
            class="px-3 py-2.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 no-underline text-gray-800 dark:text-gray-200"
            active-class="!bg-blue-600/20 !font-semibold"
            to="/admin/dashboard"
            @click="mobileMenuOpen = false"
          >
            Painel
          </RouterLink>
          <RouterLink
            class="px-3 py-2.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 no-underline text-gray-800 dark:text-gray-200"
            active-class="!bg-blue-600/20 !font-semibold"
            to="/admin/products"
            @click="mobileMenuOpen = false"
          >
            Produtos
          </RouterLink>
          <RouterLink
            class="px-3 py-2.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 no-underline text-gray-800 dark:text-gray-200"
            active-class="!bg-blue-600/20 !font-semibold"
            to="/admin/categories"
            @click="mobileMenuOpen = false"
          >
            Categorias
          </RouterLink>
          <RouterLink
            class="px-3 py-2.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 no-underline text-gray-800 dark:text-gray-200"
            active-class="!bg-blue-600/20 !font-semibold"
            to="/admin/reports"
            @click="mobileMenuOpen = false"
          >
            Relatórios
          </RouterLink>
          <RouterLink
            class="px-3 py-2.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 no-underline text-gray-800 dark:text-gray-200"
            active-class="!bg-blue-600/20 !font-semibold"
            to="/admin/users"
            @click="mobileMenuOpen = false"
          >
            Usuários
          </RouterLink>
          <RouterLink
            class="px-3 py-2.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 no-underline text-gray-800 dark:text-gray-200"
            active-class="!bg-blue-600/20 !font-semibold"
            to="/admin/orders"
            @click="mobileMenuOpen = false"
          >
            Pedidos
          </RouterLink>
          <RouterLink
            class="px-3 py-2.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 no-underline text-gray-800 dark:text-gray-200"
            active-class="!bg-blue-600/20 !font-semibold"
            to="/admin/settings"
            @click="mobileMenuOpen = false"
          >
            Configurações
          </RouterLink>
          <RouterLink
            class="px-3 py-2.5 rounded-md hover:bg-amber-200/50 dark:hover:bg-amber-900/30 no-underline text-amber-900 dark:text-amber-100 mt-2"
            to="/"
            @click="mobileMenuOpen = false"
          >
            ← Voltar à loja
          </RouterLink>
        </nav>
      </Dialog>

      <section class="flex-1 min-w-0 space-y-3 sm:space-y-4">
        <nav
          class="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
          aria-label="Breadcrumb"
        >
          <RouterLink class="text-blue-700 dark:text-blue-300 no-underline hover:underline" to="/admin/dashboard">
            Administração
          </RouterLink>
          <span v-if="crumb" aria-hidden="true">/</span>
          <span v-if="crumb" class="font-medium text-gray-800 dark:text-gray-200">{{ crumb }}</span>
        </nav>

        <div class="rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-4 sm:p-6 shadow-sm">
          <router-view />
        </div>
      </section>
    </div>
  </div>
</template>
