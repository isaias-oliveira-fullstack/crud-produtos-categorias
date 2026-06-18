import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { cartService } from "../services/cartService";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("../layouts/ConsumerLayout.vue"),
    children: [
      {
        path: "",
        name: "home",
        component: () => import("../views/HomeView.vue"),
      },
      {
        path: "products",
        name: "products",
        component: () => import("../views/ProductsView.vue"),
      },
      {
        path: "products/:category",
        name: "products-category",
        component: () => import("../views/ProductsView.vue"),
      },
      {
        path: "product/:slug",
        name: "product-detail",
        component: () => import("../views/ProductDetailView.vue"),
        props: true,
      },
      {
        path: "cart",
        name: "cart",
        component: () => import("../views/CartView.vue"),
      },
      {
        path: "checkout",
        name: "checkout",
        component: () => import("../views/CheckoutView.vue"),
        meta: { requiresCheckout: true },
      },
      {
        path: "order-success",
        name: "order-success",
        component: () => import("../views/OrderSuccessView.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "login",
        name: "login",
        component: () => import("../views/LoginView.vue"),
        meta: { guestOnly: true },
      },
      {
        path: "register",
        name: "register",
        component: () => import("../views/RegisterView.vue"),
        meta: { guestOnly: true },
      },
      {
        path: "profile",
        component: () => import("../layouts/ProfileLayout.vue"),
        meta: { requiresAuth: true },
        redirect: { name: "profile-edit" },
        children: [
          {
            path: "dashboard",
            name: "profile-dashboard",
            component: () => import("../views/ProfileDashboardView.vue"),
          },
          {
            path: "edit",
            name: "profile-edit",
            component: () => import("../views/ProfileEditView.vue"),
          },
          {
            path: "orders",
            name: "profile-orders",
            component: () => import("../views/ProfileOrdersView.vue"),
          },
          {
            path: "favorites",
            name: "profile-favorites",
            component: () => import("../views/ProfileFavoritesView.vue"),
            meta: { requiresAuth: true },
          },
          {
            path: "tracking",
            name: "profile-tracking",
            component: () => import("../views/ProfileTrackingView.vue"),
          },
        ],
      },
    ],
  },
  {
    path: "/admin",
    component: () => import("../layouts/AdminLayout.vue"),
    meta: { requiresAdmin: true },
    children: [
      {
        path: "dashboard",
        name: "admin-dashboard",
        component: () => import("../views/AdminDashboardView.vue"),
      },
      {
        path: "products",
        name: "admin-products",
        component: () => import("../views/AdminProductsView.vue"),
      },
      {
        path: "categories",
        name: "admin-categories",
        component: () => import("../views/AdminCategoriesView.vue"),
      },
      {
        path: "reports",
        name: "admin-reports",
        component: () => import("../views/AdminReportsView.vue"),
      },
      {
        path: "users",
        name: "admin-users",
        component: () => import("../views/AdminUsersView.vue"),
      },
      {
        path: "orders",
        name: "admin-orders",
        component: () => import("../views/AdminOrdersView.vue"),
      },
      {
        path: "settings",
        name: "admin-settings",
        component: () => import("../views/AdminSettingsView.vue"),
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("../views/NotFoundView.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: "home" };
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: "home" };
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      name: "login",
      query: { redirect: to.fullPath },
    };
  }

  if (to.name === "order-success" && auth.isAuthenticated) {
    const oid = to.query.orderId;
    if (typeof oid !== "string" || !oid.trim()) {
      return { name: "home" };
    }
  }

  if (to.meta.requiresCheckout && auth.isAuthenticated) {
    if (cartService.isEmpty()) {
      return { name: "cart" };
    }
  }

  return true;
});
