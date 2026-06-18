<script lang="ts" setup>
import { ref, computed, getCurrentInstance } from "vue";
import useVuelidate from "@vuelidate/core";
import { required, email as emailRule, minLength, sameAs, helpers } from "@vuelidate/validators";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const inst = getCurrentInstance();
const toast = inst?.appContext.config.globalProperties.$toast;

const name = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const rules = {
  name: { 
    required: helpers.withMessage("Nome obrigatório", required)
  },
  email: { 
    required: helpers.withMessage("E-mail obrigatório", required),
    email: helpers.withMessage("E-mail inválido", emailRule)
  },
  password: { 
    required: helpers.withMessage("Senha obrigatória", required),
    minLength: helpers.withMessage("Senha muito curta (mínimo 6 caracteres)", minLength(6))
  },
  confirmPassword: { 
    required: helpers.withMessage("Confirme a senha", required),
    sameAsPassword: helpers.withMessage("As senhas não coincidem", sameAs(password))
  },
};

const state = { name, email, password, confirmPassword };
const v$ = useVuelidate(rules, state);

const loading = computed(() => auth.loading);

const fieldErrors = (field: string) => {
  const f = (v$.value as any)[field];
  if (!f || !f.$dirty) return [] as string[];
  return f.$errors.map((e: any) => e.$message || "Campo inválido");
};

async function submit() {
  v$.value.$touch();
  if (v$.value.$invalid) return;
  const res = await auth.register({ name: name.value, email: email.value, password: password.value });
  if (!res.ok) {
    toast?.add({ severity: "error", summary: "Cadastro", detail: res.error, life: 4000 });
    return;
  }
  toast?.add({ severity: "success", summary: "Conta criada", detail: "Você já está autenticado.", life: 3000 });
  const redirect = route.query.redirect;
  const path = typeof redirect === "string" && redirect ? redirect : "/profile/dashboard";
  await router.replace(path);
}
</script>

<template>
  <section class="max-w-md mx-auto">
    <Card class="bg-gray-100! dark:bg-gray-800! border border-gray-200 dark:border-gray-700">
      <template #title>
        <span class="text-lg font-semibold text-gray-800! dark:text-gray-200!">Criar conta</span>
      </template>
      <template #content>
        <form class="space-y-4" @submit.prevent="submit">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-800! dark:text-gray-200!" for="name">Nome</label>
            <InputText
              id="name"
              v-model="name"
              autocomplete="name"
              :class="[
                'w-full transition-colors! bg-gray-200! dark:bg-gray-900! text-gray-900! dark:text-gray-100! focus:ring-2 focus:ring-primary/50 focus:outline-none! rounded-md!',
                v$.name.$error ? 'border-red-500! dark:border-red-400!' : 'border-gray-300! dark:border-gray-700!'
              ]"
            />
            <div v-if="fieldErrors('name').length" class="mt-1">
              <small v-for="(err, idx) in fieldErrors('name')" :key="idx" class="block text-sm text-red-600">{{ err }}</small>
            </div>
          </div>
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
            <div v-if="fieldErrors('email').length" class="mt-1">
              <small v-for="(err, idx) in fieldErrors('email')" :key="idx" class="block text-sm text-red-600">{{ err }}</small>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-800! dark:text-gray-200!" for="password">Senha</label>
            <Password
              id="password"
              v-model="password"
              toggle-mask
              prompt-label="Escolha uma senha"
              weak-label="Senha fraca"
              medium-label="Senha média"
              strong-label="Senha forte"
              :class="[
                '[&_input]:w-full [&_.p-inputtext]:transition-colors! [&_.p-inputtext]:bg-gray-200! [&_.p-inputtext]:dark:bg-gray-900! [&_.p-inputtext]:text-gray-900! [&_.p-inputtext]:dark:text-gray-100! [&_.p-inputtext]:focus:ring-2 [&_.p-inputtext]:focus:ring-primary/50 [&_.p-inputtext]:focus:outline-none!',
                v$.password.$error ? '[&_input]:border-red-500! dark:[&_input]:border-red-400!' : '[&_input]:border-gray-300! dark:[&_input]:border-gray-700!'
              ]"
            />
            <div v-if="fieldErrors('password').length" class="mt-1">
              <small v-for="(err, idx) in fieldErrors('password')" :key="idx" class="block text-sm text-red-600">{{ err }}</small>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-medium text-gray-800! dark:text-gray-200!" for="confirmPassword">Confirmar senha</label>
            <Password
              id="confirmPassword"
              v-model="confirmPassword"
              toggle-mask
              prompt-label="Confirme a senha"
              weak-label="Senha fraca"
              medium-label="Senha média"
              strong-label="Senha forte"
              :class="[
                '[&_input]:w-full [&_.p-inputtext]:transition-colors! [&_.p-inputtext]:bg-gray-200! [&_.p-inputtext]:dark:bg-gray-900! [&_.p-inputtext]:text-gray-900! [&_.p-inputtext]:dark:text-gray-100! [&_.p-inputtext]:focus:ring-2 [&_.p-inputtext]:focus:ring-primary/50 [&_.p-inputtext]:focus:outline-none!',
                v$.confirmPassword.$error ? '[&_input]:border-red-500! dark:[&_input]:border-red-400!' : '[&_input]:border-gray-300! dark:[&_input]:border-gray-700!'
              ]"
            />
            <div v-if="fieldErrors('confirmPassword').length" class="mt-1">
              <small v-for="(err, idx) in fieldErrors('confirmPassword')" :key="idx" class="block text-sm text-red-600">{{ err }}</small>
            </div>
          </div>
          <Button type="submit" label="Cadastrar" class="w-full" icon="pi pi-user-plus" :loading="loading" :disabled="v$.$invalid || loading" />
          <p class="text-base text-center m-0 text-gray-600 dark:text-gray-400">
            Já tem conta?
            <RouterLink class="text-blue-700 dark:text-blue-300 font-semibold" :to="{ name: 'login', query: $route.query }">
              Entrar
            </RouterLink>
          </p>
        </form>
      </template>
    </Card>
  </section>
</template>
