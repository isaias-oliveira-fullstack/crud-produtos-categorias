<script lang="ts">
import { defineComponent } from "vue";
import { UserRole } from "@shared/classes/User";
import type { UserRecord } from "@shared/models/UserRecord";
import { authService } from "../services/authService";

export default defineComponent({
  name: "AdminUsersView",

  data() {
    return {
      UserRole,
      rows: [] as UserRecord[],
      loading: false,
      dialogVisible: false,
      editingId: null as number | null,
      form: {
        name: "",
        email: "",
        password: "",
        role: UserRole.USER as UserRole,
      },
    };
  },

  mounted() {
    this.reload();
  },

  methods: {
    reload(): void {
      this.loading = true;
      try {
        this.rows = [...authService.getUsers()].sort((a, b) => a.id - b.id);
      } finally {
        this.loading = false;
      }
    },
    openCreate(): void {
      this.editingId = null;
      this.form = {
        name: "",
        email: "",
        password: "",
        role: UserRole.USER,
      };
      this.dialogVisible = true;
    },
    openEdit(user: UserRecord): void {
      this.editingId = user.id;
      this.form = {
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
      };
      this.dialogVisible = true;
    },
    save(): void {
      if (!this.form.name.trim() || !this.form.email.trim()) {
        this.$toast.add({
          severity: "warn",
          summary: "Campos obrigatórios",
          detail: "Nome e e-mail são obrigatórios.",
          life: 3000,
        });
        return;
      }
      if (this.editingId === null) {
        if (!this.form.password || this.form.password.length < 4) {
          this.$toast.add({
            severity: "warn",
            summary: "Senha",
            detail: "Informe uma senha com pelo menos 4 caracteres.",
            life: 3000,
          });
          return;
        }
        const res = authService.adminCreateUser({
          name: this.form.name,
          email: this.form.email,
          password: this.form.password,
          role: this.form.role,
        });
        if (!res.ok) {
          this.$toast.add({ severity: "error", summary: "Usuário", detail: res.error, life: 4000 });
          return;
        }
        this.$toast.add({ severity: "success", summary: "Usuário criado", life: 2500 });
      } else {
        const res = authService.adminUpdateUser(this.editingId, {
          name: this.form.name,
          email: this.form.email,
          role: this.form.role,
          ...(this.form.password.length >= 4 ? { password: this.form.password } : {}),
        });
        if (!res.ok) {
          this.$toast.add({ severity: "error", summary: "Usuário", detail: res.error, life: 4000 });
          return;
        }
        this.$toast.add({ severity: "success", summary: "Usuário atualizado", life: 2500 });
      }
      this.dialogVisible = false;
      this.reload();
    },
    confirmDelete(user: UserRecord): void {
      this.$confirm.require({
        message: `Excluir ${user.email}?`,
        header: "Confirmar exclusão",
        icon: "pi pi-exclamation-triangle",
        accept: () => {
          const res = authService.adminDeleteUser(user.id);
          if (!res.ok) {
            this.$toast.add({ severity: "error", summary: "Exclusão", detail: res.error, life: 4000 });
            return;
          }
          this.$toast.add({ severity: "success", summary: "Removido", life: 2500 });
          this.reload();
        },
      });
    },
    roleLabel(role: UserRole): string {
      return role === UserRole.ADMIN ? "Administrador" : "Usuário";
    },
  },
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold m-0">Usuários</h1>
        <p class="m-0 mt-1 text-sm text-gray-600 dark:text-gray-400">
          CRUD completo (localStorage). Proteção: não remover o único administrador.
        </p>
      </div>
      <Button label="Novo usuário" icon="pi pi-user-plus" @click="openCreate" />
    </div>

    <DataTable :value="rows" :loading="loading" paginator :rows="10" responsive-layout="scroll">
      <Column field="id" header="ID" />
      <Column field="name" header="Nome" />
      <Column field="email" header="E-mail" />
      <Column header="Papel">
        <template #body="{ data }">
          <Tag :severity="data.role === 'ADMIN' ? 'warn' : 'info'" :value="roleLabel(data.role)" />
        </template>
      </Column>
      <Column header="Ações" :exportable="false" style="min-width: 8rem">
        <template #body="{ data }">
          <Button icon="pi pi-pencil" text rounded aria-label="Editar" @click="openEdit(data)" />
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            aria-label="Excluir"
            @click="confirmDelete(data)"
          />
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      :header="editingId === null ? 'Novo usuário' : 'Editar usuário'"
      class="w-[min(100%,28rem)]"
    >
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="uname">Nome</label>
          <InputText id="uname" v-model="form.name" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="uemail">E-mail</label>
          <InputText id="uemail" v-model="form.email" type="email" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="urole">Papel</label>
          <select
            id="urole"
            v-model="form.role"
            class="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
          >
            <option :value="UserRole.USER">Usuário</option>
            <option :value="UserRole.ADMIN">Administrador</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="upass">
            Senha {{ editingId !== null ? "(deixe em branco para manter)" : "" }}
          </label>
          <Password
            id="upass"
            v-model="form.password"
            class="w-full"
            toggle-mask
            input-class="w-full"
            :feedback="false"
          />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="dialogVisible = false" />
        <Button label="Salvar" icon="pi pi-check" @click="save" />
      </template>
    </Dialog>
  </div>
</template>
