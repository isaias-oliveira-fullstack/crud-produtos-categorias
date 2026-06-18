<script lang="ts">
import { defineComponent } from "vue";
import { authService } from "../services/authService";
import { useAuthStore } from "../stores/auth";

export default defineComponent({
  name: "ProfileEditView",

  data() {
    return {
      name: "",
      email: "",
      password: "",
      loading: false,
    };
  },

  mounted() {
    const auth = useAuthStore();
    const u = auth.user;
    if (u) {
      this.name = u.name;
      this.email = u.email;
    }
  },

  methods: {
    async save(): Promise<void> {
      this.loading = true;
      try {
        const auth = useAuthStore();
        const res = authService.updateSelf({
          name: this.name,
          email: this.email,
          password: this.password.length >= 4 ? this.password : undefined,
        });
        if (!res.ok) {
          this.$toast.add({ severity: "error", summary: "Perfil", detail: res.error, life: 4000 });
          return;
        }
        if (auth.user) {
          auth.user.name = this.name;
          auth.user.email = this.email;
        }
        this.password = "";
        this.$toast.add({ severity: "success", summary: "Dados atualizados", life: 2500 });
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>

<template>
  <div class="space-y-4">
    <h1 class="text-xl font-bold m-0">Editar dados</h1>
    <Card class="bg-gray-100! dark:bg-gray-800! border border-gray-200 dark:border-gray-700 max-w-lg">
      <template #content>
        <form class="space-y-4" @submit.prevent="save">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium" for="n">Nome</label>
            <InputText id="n" v-model="name" class="w-full" required />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium" for="e">E-mail</label>
            <InputText id="e" v-model="email" type="email" class="w-full" required />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium" for="p">Nova senha (opcional)</label>
            <Password
              id="p"
              v-model="password"
              class="w-full"
              toggle-mask
              input-class="w-full"
              :feedback="false"
            />
          </div>
          <Button type="submit" label="Salvar" icon="pi pi-save" :loading="loading" />
        </form>
      </template>
    </Card>
  </div>
</template>
