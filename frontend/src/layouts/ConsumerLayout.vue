<script lang="ts">
import { defineComponent } from "vue";
import type { MenuItem } from 'primevue/menuitem';
import { CartItem } from "@shared/models/CartItem";
import { cartService } from "../services/cartService";
import { useAuthStore } from "../stores/auth";
import { storeSettingsService } from "../services/storeSettingsService";
import { formatBRL } from "../utils/format";

export default defineComponent({
  name: "ConsumerLayout",

  data() {
    return {
      darkMode: false,
      cartTick: 0,
      unsubscribe: null as null | (() => void),
      brandTick: 0,
      miniCartOpen: false,
      mobileNavOpen: false,
      isMobileViewport: false,
    };
  },

  computed: {
    user() {
      return useAuthStore().user;
    },
    greeting(): string {
      const auth = useAuthStore();

      const hour = new Date().getHours();
      let saudacao = 'Olá';

      if (hour < 12) saudacao = 'Bom dia';
      else if (hour < 18) saudacao = 'Boa tarde';
      else saudacao = 'Boa noite';

      if (!auth.isAuthenticated) return `${saudacao}, Cliente/Visitante`;

      const user = auth.user;
      if (!user || !user.name) return `${saudacao}, Cliente/Visitante`;

      const nameParts = user.name.trim().split(' ');
      const displayName = nameParts.slice(0, 2).join(' ');

      return `${saudacao}, ${displayName}`;
    },
    avatarUrl(): string {
      const auth = useAuthStore();

      if (!auth.isAuthenticated) {
        return 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png';
      }

      return auth.isAdmin
        ? 'https://primefaces.org/cdn/primevue/images/organization/walter.jpg'
        : 'https://primefaces.org/cdn/primevue/images/avatar/ionibowcher.png';
    },
    itemsLeft(): MenuItem[] {
      return [
        { label: 'Início', icon: 'pi pi-home', command: () => this.$router.push('/') },
        { label: 'Produtos', icon: 'pi pi-shopping-cart', command: () => this.$router.push('/products') },
      ];
    },

    itemsRight(): MenuItem[] {
      const auth = useAuthStore();

      if (!auth.isAuthenticated) {
        return [
          {
            label: 'Entrar / Cadastrar',
            icon: 'pi pi-user',
            items: [
              { label: 'Entrar', icon: 'pi pi-sign-in', command: () => this.$router.push('/login') },
              { label: 'Cadastrar', icon: 'pi pi-user-plus', command: () => this.$router.push('/register') },
            ]
          }
        ];
      }

      return [
        {
          label: this.greeting ?? 'Minha Conta',
          icon: auth.isAuthenticated ? 'pi pi-user' : 'pi pi-user',
          items: [
            { label: 'Cliente', command: () => this.$router.push('/profile/dashboard') },
            ...(auth.isAdmin
              ? [{ label: 'Administração', command: () => this.$router.push('/admin/dashboard') }]
              : []),
            {
              label: 'Sair',
              command: () => {
                this.logout();
              }
            }
          ],
          template: "userTemplate"
        }
      ];
    },

    items(): MenuItem[] {
      return [...this.itemsLeft, ...this.itemsRight];
    },
    cartCount(): number {
      this.cartTick;
      return cartService.getTotalItems();
    },
    cartItems(): CartItem[] {
      this.cartTick;
      return cartService.getItems();
    },
    cartTotal(): number {
      this.cartTick;
      return cartService.getFinalPrice();
    },
    cartEmpty(): boolean {
      this.cartTick;
      return cartService.isEmpty();
    },
    isLoggedIn(): boolean {
      return useAuthStore().isAuthenticated;
    },
    isAdminUser(): boolean {
      return useAuthStore().isAdmin;
    },
    storeTitle(): string {
      this.brandTick;
      return storeSettingsService.get().storeName;
    },
    storeTagline(): string {
      this.brandTick;
      return storeSettingsService.get().tagline;
    },
    linkClass(): string {
      return "px-2 py-1.5 rounded-md text-gray-800 dark:text-gray-200 hover:bg-gray-300/80 dark:hover:bg-gray-800 text-sm sm:text-base";
    },
  },

  mounted() {
    this.applyStoreTheme();
    this.updateViewport();
    window.addEventListener("resize", this.updateViewport);
    this.unsubscribe = cartService.subscribe(() => {
      this.cartTick += 1;
    });
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.updateViewport);
    this.unsubscribe?.();
  },

  watch: {
    $route() {
      this.brandTick += 1;
      this.applyStoreTheme();
      this.miniCartOpen = false;
      this.mobileNavOpen = false;
    },
  },

  methods: {
    formatBRL,
    updateViewport(): void {
      if (typeof window === "undefined") return;
      this.isMobileViewport = window.innerWidth < 1024;
      if (!this.isMobileViewport) {
        this.mobileNavOpen = false;
      }
    },
    applyStoreTheme(): void {
      const pref = storeSettingsService.get().themePreference;
      if (pref === "dark") {
        this.darkMode = true;
        document.documentElement.classList.add("dark");
        return;
      }
      if (pref === "light") {
        this.darkMode = false;
        document.documentElement.classList.remove("dark");
        return;
      }
    },
    lineSubtotal(item: CartItem): number {
      return item.product.price * item.quantity;
    },
    productThumb(item: CartItem): string {
      return (
        item.product.mainImage ||
        item.product.thumbnail ||
        "https://via.placeholder.com/160x160?text=Sem+imagem"
      );
    },
    onCartMouseEnter(): void {
      if (!this.isMobileViewport) this.miniCartOpen = true;
    },
    onCartMouseLeave(): void {
      if (!this.isMobileViewport) this.miniCartOpen = false;
    },
    onCartTriggerClick(): void {
      if (this.isMobileViewport) {
        this.miniCartOpen = !this.miniCartOpen;
      } else {
        void this.$router.push({ name: "cart" });
      }
    },
    clearCart(): void {
      cartService.clear();
      this.$toast.add({ severity: "info", summary: "Carrinho limpo", life: 2200 });
    },
    removeLine(itemId: string): void {
      cartService.removeItem(itemId);
    },
    goCheckout(): void {
      if (this.cartEmpty) return;
      void this.$router.push({ name: "checkout" });
      this.miniCartOpen = false;
    },
    goCartPage(): void {
      void this.$router.push({ name: "cart" });
      this.miniCartOpen = false;
    },
    toggleDarkMode(): void {
      const pref = storeSettingsService.get().themePreference;
      if (pref === "light" || pref === "dark") {
        this.$toast.add({
          severity: "info",
          summary: "Tema fixo",
          detail: "O administrador definiu tema claro/escuro nas configurações.",
          life: 3500,
        });
        return;
      }
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
    },
  },
});
</script>

<template>
  <div class="min-h-screen transition-colors bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <header class="max-w-240 mx-auto px-3 py-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <Button icon="pi pi-bars" text rounded class="shrink-0 md:hidden!" aria-label="Abrir menu"
            @click="mobileNavOpen = true" />
          <div class="min-w-0">
            <RouterLink to="/"
              class="text-lg sm:text-[1.35rem] font-bold mb-1 no-underline text-gray-900 dark:text-gray-100 hover:opacity-90 block truncate">
              {{ storeTitle }}
            </RouterLink>
            <p class="m-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {{ storeTagline }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-1 sm:gap-2 shrink-0">
          <div class="relative" @mouseenter="onCartMouseEnter" @mouseleave="onCartMouseLeave">
            <Button
              size="small"
              type="button"
              icon="pi pi-shopping-cart"
              rounded
              class="
              w-9!
              h-9!
              relative
              inline-block!
              font-semibold
              tracking-wide
              align-middle
              transition
              duration-500 
    text-base 
    text-center 
    bg-primary 
    text-white 
    rounded-md 
    hover:bg-primary-dark 
    focus:outline-none 
    overflow-visible!

    [&_.p-button-icon]:text-base!

    [&_.p-badge]:absolute!
    [&_.p-badge]:-top-2!
    [&_.p-badge]:-right-2!
    [&_.p-badge]:min-w-5!
    [&_.p-badge]:h-5!
    [&_.p-badge]:px-1!
    [&_.p-badge]:text-[0.55rem]!
    [&_.p-badge]:font-semibold!
    [&_.p-badge]:items-center!
    [&_.p-badge]:justify-center!
    [&_.p-badge]:rounded-full!
    [&_.p-badge]:bg-emerald-600!
    [&_.p-badge]:text-white!
    "
  :badge="cartCount > 0 ? `${cartCount}` : undefined"
  badgeSeverity="contrast"
  aria-haspopup="true"
  :aria-expanded="miniCartOpen"
/>
            
            <div v-show="miniCartOpen"
              class="fixed md:absolute left-0 md:left-auto right-0 top-16 md:top-full z-100 px-3 md:px-0 pt-1 w-full md:w-[min(calc(100vw-1rem),22rem)]"
              role="region" aria-label="Resumo do carrinho" @click.stop>
              <div
                class="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl shadow-gray-900/15 dark:shadow-black/40 overflow-hidden flex flex-col max-h-[min(85vh,28rem)]">
                <div
                  class="flex justify-between items-center px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                  <p class="m-0 text-base font-semibold text-gray-900 dark:text-gray-100">
                    Meu Carrinho {{ cartCount === 0 ? "" : cartCount === 1 ? "(1 item)" : `(${cartCount} itens)` }}
                  </p>
                  <Button label="" icon="pi pi-trash" severity="danger" outlined text class="w-full"
                    :disabled="cartEmpty" @click="clearCart" />
                </div>

                <div v-if="cartEmpty" class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                  Carrinho vazio
                </div>

                <ul v-else
                  class="m-0 p-0 list-none overflow-y-auto flex-1 min-h-0 divide-y divide-gray-100 dark:divide-gray-800">
                  <li v-for="row in cartItems" :key="row.itemId ?? row.product.id"
                    class="flex gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div
                      class="w-14 h-14 shrink-0 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 flex items-center justify-center overflow-hidden">
                      <img v-if="productThumb(row)" :src="productThumb(row)" :alt="row.product.name"
                        class="w-full h-full object-contain" />
                      <i v-else class="pi pi-image text-gray-400 text-lg" aria-hidden="true" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="m-0 text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
                        {{ row.product.name }}
                      </p>
                      <p class="m-0 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {{ formatBRL(row.product.price) }} ×
                        {{ row.quantity }}
                      </p>
                      <p v-if="row.variantNote" class="m-0 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                        {{ row.variantNote }}
                      </p>
                      <p class="m-0 mt-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                        Subtotal: {{ formatBRL(lineSubtotal(row)) }}
                      </p>
                    </div>
                    <Button icon="pi pi-times" severity="danger" text rounded class="shrink-0 self-start!"
                      title="Remover item" aria-label="Remover item" @click="removeLine(row.itemId ?? String(row.product.id))" />
                  </li>
                </ul>

                <div v-if="!cartEmpty"
                  class="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div class="flex justify-between items-center text-sm font-semibold">
                    <span class="text-gray-700 dark:text-gray-300">Total</span>
                    <span class="text-emerald-700 dark:text-emerald-400">{{
                      formatBRL(cartTotal)
                    }}</span>
                  </div>
                </div>

                <div
                  class="p-3 flex flex-col gap-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">

                  <div class="flex gap-2">
                    <Button label="Carrinho" icon="pi pi-shopping-cart" severity="secondary" outlined class="w-full"
                      @click="goCartPage" />
                    <Button label="Confirmar" icon="pi pi-check" class="w-full" :disabled="cartEmpty"
                      @click="goCheckout" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button
            size="small" 
            :icon="darkMode 
              ? 'pi pi-moon' 
              : 'pi pi-sun'
            " 
            rounded
            class="
              w-9!
              h-9!
              inline-block 
              font-semibold 
              tracking-wide 
              align-middle 
              transition 
              duration-500 
              text-base 
              text-center 
              bg-primary 
              text-white 
              rounded-md 
              hover:bg-primary-dark 
              focus:outline-none
    
              [&_.p-button-icon]:text-base!
            "
            :aria-label="darkMode 
              ? 'Modo claro' 
              : 'Modo escuro'
            " 
            @click="toggleDarkMode" 
          />
        </div>
      </div>
      <nav>
        <Menubar class="
            text-gray-600! 
            dark:text-gray-400!
            p-1! 
            hover:bg-gray-100! 
            dark:hover:bg-gray-700/50! 
            rounded-md! 
            overflow-hidden! 
            shadow-sm!
            bg-gray-100! 
            dark:bg-gray-800! 
            border! 
            border-gray-200! 
            dark:border-gray-700!
          ">
          <template #start>
            <Menubar :model="itemsLeft" class="
                  hidden! 
                  md:flex! 
                  border-0! 
                  bg-transparent! 
                  [&_.p-menubar-item-link]:text-gray-600! 
                  [&_.p-menubar-item-link]:dark:text-gray-200! 
                  [&_.p-menubar-item-link]:hover:text-green-600! 
                  [&_.p-menubar-item-link]:dark:hover:text-green-400! 
                  [&_.p-menubar-item-link]:px-2! 
                  [&_.p-menubar-item-link]:py-1.5!  
                  
                  [&_.p-menubar-item-icon]:dark:text-gray-400! 
                  [&_.p-menubar-item-link]:hover:[&_.p-menubar-item-icon]:text-green-600! 
                  [&_.p-menubar-item-link]:hover:[&_.p-menubar-item-icon]:dark:text-green-400!
                  
                  [&_.p-focus]:text-green-600!
                  [&_.p-focus]:dark:text-green-400!

                  [&_.p-menubar-item-content]:bg-transparent! 
                  [&_.p-menubar-item-content]:hover:bg-transparent! 
                  [&_.p-menubar-item-content]:focus:bg-transparent! 
                  [&_.p-menubar-item-content]:shadow-none!
                  [&_.p-menubar-item-content]:rounded-none!" />
          </template>

          <template #end>
            <div>
              <Menubar :model="itemsRight" class="
                  hidden! 
                  md:flex! 
                  border-0! 
                  bg-transparent! 

                  [&_.p-menubar-item-link]:text-gray-600! 
                  [&_.p-menubar-item-link]:dark:text-gray-200! 
                  [&_.p-menubar-item-link]:hover:text-green-600! 
                  [&_.p-menubar-item-link]:dark:hover:text-green-400! 
                  [&_.p-menubar-item-link]:px-0! 
                  [&_.p-menubar-item-link]:py-0!  
                  
                  [&_.p-menubar-item-icon]:dark:text-gray-400! 
                  [&_.p-menubar-item-link]:hover:[&_.p-menubar-item-icon]:text-green-600! 
                  [&_.p-menubar-item-link]:hover:[&_.p-menubar-item-icon]:dark:text-green-400!

                  [&_.pi]:text-gray-600! 
                  [&_.pi]:dark:text-gray-200! 
                  [&_.pi]:hover:text-green-600! 
                  [&_.pi]:dark:hover:text-green-400!
                  
                  [&_.p-focus]:text-green-600!
                  [&_.p-focus]:dark:text-green-400!
                  
                  [&_.p-menubar-item-content]:flex! 
                  [&_.p-menubar-item-content]:items-center! 
                  [&_.p-menubar-item-content]:gap-3!
                  [&_.p-menubar-item-content]:bg-transparent! 
                  [&_.p-menubar-item-content]:hover:bg-transparent! 
                  [&_.p-menubar-item-content]:focus:bg-transparent! 
                  [&_.p-menubar-item-content]:shadow-none!
                  [&_.p-menubar-item-content]:rounded-none!
                  
                  [&_.p-menubar-submenu]:bg-gray-100! 
                  [&_.p-menubar-submenu]:dark:bg-gray-800!
                  [&_.p-menubar-submenu]:border-b!
                  [&_.p-menubar-submenu]:border-slate-200!
                  [&_.p-menubar-submenu]:dark:border-slate-700!
                  [&_.p-menubar-submenu_.p-menubar-item-link]:px-1!
                  [&_.p-menubar-submenu_.p-menubar-item-link]:py-[0.2rem]!

                  [&_.p-menubar-item-link]:bg-transparent!">
                <template #item="{ item, props }">
                  <a v-bind="props.action" class="flex items-center gap-2">
                    <span v-if="item.icon" :class="item.icon"></span>
                    <span>{{ item.label }}</span>
                    <Avatar v-if="item.template === 'userTemplate'" :image="avatarUrl" shape="circle" />
                  </a>
                  <i v-if="item.template === 'userTemplate'" class="pi pi-sign-out cursor-pointer" @click="logout"></i>
                </template>
              </Menubar>

              <Button icon="pi pi-user" text class="md:hidden!" aria-label="Menu" @click="mobileNavOpen = true" />

              <Dialog v-model:visible="mobileNavOpen" modal header="Menu" class="
      w-[min(100%,20rem)]
      " :dismissable-mask="true" :breakpoints="{ '576px': '100%' }">
                <Menubar class="flex flex-col" />
              </Dialog>
            </div>
          </template>
        </Menubar>
      </nav>
    </header>

    <main class="max-w-240 mx-auto px-3 pb-6 md:pb-8">
      <router-view />
    </main>

    <footer
      class="mx-auto flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 py-5 border-t border-gray-300 dark:border-gray-700">
      <p>© {{ new Date().getFullYear() }} <strong>{{ storeTitle }}</strong>. Todos os direitos reservados.</p>
    </footer>
  </div>
</template>
