<script lang="ts" setup>
import { ref, computed, getCurrentInstance } from "vue";
import useVuelidate from "@vuelidate/core";
import { required, email as emailRule, helpers } from "@vuelidate/validators";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const inst = getCurrentInstance();
const toast = inst?.appContext.config.globalProperties.$toast;

const email = ref("");
const password = ref("");

const rules = {
  email: { 
    required: helpers.withMessage("E-mail obrigatório", required),
    email: helpers.withMessage("E-mail inválido", emailRule)
  },
  password: { 
    required: helpers.withMessage("Senha obrigatória", required)
  },
};

const state = { email, password };
const v$ = useVuelidate(rules, state);

const loading = computed(() => auth.loading);

const emailErrors = computed(() => {
  const e = v$.value.email;
  if (!e.$dirty) return [];
  return e.$errors.map((err: any) => err.$message || "Campo inválido");
});

const passwordErrors = computed(() => {
  const p = v$.value.password;
  if (!p.$dirty) return [];
  return p.$errors.map((err: any) => err.$message || "Campo inválido");
});

async function submit() {
  v$.value.$touch();
  if (v$.value.$invalid) return;
  const res = await auth.login(email.value, password.value);
  if (!res.ok) {
    toast?.add({ severity: "error", summary: "Falha no login", detail: res.error, life: 4000 });
    return;
  }
  toast?.add({ severity: "success", summary: "Bem-vindo", detail: res.user.name, life: 2500 });
  const redirect = route.query.redirect;
  let path = "/";
  if (typeof redirect === "string" && redirect) path = redirect;
  else path = res.user.role === "ADMIN" ? "/admin/dashboard" : "/profile/dashboard";
  await router.replace(path);
}
</script>

<template>
  <section class="max-w-md mx-auto">
    <Card class="bg-gray-100! dark:bg-gray-800! border border-gray-200 dark:border-gray-700">
      <template #title>
        <span class="text-lg font-semibold text-gray-800! dark:text-gray-200!">Entrar</span>
      </template>
      <template #content>
        
          <p class="flex flex-col text-base bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-3 pt-2 mb-2 rounded-md">
            <strong>Acesso demo admin:</strong>
            <code class="text-sm">admin@loja.com</code>
            <code class="text-sm">admin123</code>
          </p>
        <form class="space-y-4" @submit.prevent="submit">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-800! dark:text-gray-200!" for="email">E-mail</label>
            <InputText
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              :class="[
                'w-full transition-colors! bg-gray-200! dark:bg-gray-900! text-gray-900! dark:text-gray-100! focus:ring-2 focus:ring-primary/50 focus:outline-none! rounded-md!',
                v$.email.$error ? 'border-red-500! dark:border-red-400!' : 'border-gray-300! dark:border-gray-700!'
              ]"
            />
            <div v-if="emailErrors.length" class="mt-1">
              <small v-for="(err, idx) in emailErrors" :key="idx" class="block text-sm text-red-600">{{ err }}</small>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-800! dark:text-gray-200!" for="password">Senha</label>
            <Password
              id="password"
              v-model="password"
              :feedback="false"
              toggle-mask
              prompt-label="Digite sua senha"
              :class="[
                '[&_input]:w-full [&_.p-inputtext]:transition-colors! [&_.p-inputtext]:bg-gray-200! [&_.p-inputtext]:dark:bg-gray-900! [&_.p-inputtext]:text-gray-900! [&_.p-inputtext]:dark:text-gray-100! [&_.p-inputtext]:focus:ring-2 [&_.p-inputtext]:focus:ring-primary/50 [&_.p-inputtext]:focus:outline-none!',
                v$.password.$error ? '[&_input]:border-red-500! dark:[&_input]:border-red-400!' : '[&_input]:border-gray-300! dark:[&_input]:border-gray-700!'
              ]"
            />
            <div v-if="passwordErrors.length" class="mt-1">
              <small v-for="(err, idx) in passwordErrors" :key="idx" class="block text-sm text-red-600">{{ err }}</small>
            </div>
          </div>
          <Button type="submit" label="Entrar" class="w-full" icon="pi pi-sign-in" :loading="loading" :disabled="v$.$invalid || loading" />
          <p class="text-base text-center m-0 text-gray-600 dark:text-gray-400">
            Não tem conta?
            <RouterLink
              class="text-blue-700 dark:text-blue-300 font-semibold"
              :to="{ name: 'register', query: $route.query }"
            >
              Cadastre-se
            </RouterLink>
          </p>
        </form>
      </template>
    </Card>
  </section>
</template>
