<script lang="ts">
import { defineComponent } from "vue";
import type { Product } from "@shared/models/Product";
import type { LocalCategory } from "@shared/models/LocalCategory";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { formatBRL } from "../utils/format";

type Row = Product & { source: "API" | "Local" };

function splitList(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export default defineComponent({
  name: "AdminProductsView",

  data() {
    return {
      rows: [] as Row[],
      categories: [] as LocalCategory[],
      loading: true,
      dialogVisible: false,
      editing: null as Product | null,
      form: {
        name: "",
        price: 0,
        categoryId: null as number | null,
        description: "",
        stock: 0,
        colorsStr: "",
        sizesStr: "",
        extrasStr: "",
        mainImage: "",
        galleryImages: [] as string[],
      },
    };
  },

  async mounted() {
    await categoryService.seedFromApiIfEmpty();
    this.categories = categoryService.list();
    await this.reload();
  },

  methods: {
    formatBRL,
    async reload(): Promise<void> {
      this.loading = true;
      try {
        const res = await productService.fetchPage({ limit: 100, skip: 0 });
        const merged = productService.getMergedCatalog(res.products);
        const sorted = merged.sort((a, b) => {
          if (a.localOnly === b.localOnly) return a.id - b.id;
          return a.localOnly ? -1 : 1;
        });
        this.rows = sorted.map((p) => ({
          ...p,
          source: p.localOnly ? "Local" : "API",
        }));
      } finally {
        this.loading = false;
      }
    },
    openCreate(): void {
      this.editing = null;
      this.form = {
        name: "",
        price: 0,
        categoryId: this.categories[0]?.id ?? null,
        description: "",
        stock: 0,
        colorsStr: "",
        sizesStr: "",
        extrasStr: "",
        mainImage: "",
        galleryImages: [],
      };
      this.dialogVisible = true;
    },
    openEdit(product: Product): void {
      this.editing = product;
      this.form = {
        name: product.name,
        price: product.price,
        categoryId: product.categoryId ?? this.categories.find((c) => c.name === product.category.title)?.id ?? null,
        description: product.description ?? "",
        stock: product.stock ?? 0,
        colorsStr: (product.colors ?? []).join(", "),
        sizesStr: (product.sizes ?? []).join(", "),
        extrasStr: (product.extraAttributes ?? []).join(", "),
        mainImage: product.mainImage ?? product.thumbnail ?? "",
        galleryImages: product.galleryImages ? [...product.galleryImages] : [],
      };
      this.dialogVisible = true;
    },
    async onMainImage(ev: Event): Promise<void> {
      const input = ev.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;
      const dataUrl = await this.readFile(file);
      this.form.mainImage = dataUrl;
    },
    async onGallery(ev: Event): Promise<void> {
      const input = ev.target as HTMLInputElement;
      const files = input.files;
      if (!files?.length) return;
      const next: string[] = [...this.form.galleryImages];
      for (let i = 0; i < files.length; i += 1) {
        next.push(await this.readFile(files[i]));
      }
      this.form.galleryImages = next.slice(0, 8);
    },
    readFile(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(file);
      });
    },
    removeGallery(idx: number): void {
      this.form.galleryImages = this.form.galleryImages.filter((_, i) => i !== idx);
    },
    async save(): Promise<void> {
      if (!this.form.name.trim() || this.form.categoryId === null) {
        this.$toast.add({
          severity: "warn",
          summary: "Campos obrigatórios",
          detail: "Nome e categoria são obrigatórios.",
          life: 3000,
        });
        return;
      }
      const colors = splitList(this.form.colorsStr);
      const sizes = splitList(this.form.sizesStr);
      const extraAttributes = splitList(this.form.extrasStr);
      if (this.editing) {
        if (this.editing.localOnly) {
          const updated: Product = {
            ...this.editing,
            name: this.form.name.trim(),
            price: Number(this.form.price),
            categoryId: this.form.categoryId,
            category: {
              id: this.form.categoryId,
              title: categoryService.getById(this.form.categoryId)?.name ?? this.editing.category.title,
            },
            description: this.form.description.trim(),
            stock: Number(this.form.stock),
            localOnly: true,
            colors: colors.length ? colors : undefined,
            sizes: sizes.length ? sizes : undefined,
            extraAttributes: extraAttributes.length ? extraAttributes : undefined,
            mainImage: this.form.mainImage || undefined,
            galleryImages: this.form.galleryImages.length ? this.form.galleryImages : undefined,
            thumbnail: this.form.mainImage || this.form.galleryImages[0] || this.editing.thumbnail,
          };
          productService.updateLocal(updated);
          this.$toast.add({ severity: "success", summary: "Atualizado", life: 2500 });
        } else {
          try {
            await productService.updateRemote(this.editing.id, {
              name: this.form.name.trim(),
              price: Number(this.form.price),
              stock: Number(this.form.stock),
              categoryId: this.form.categoryId,
              description: this.form.description.trim() || undefined,
              mainImage: this.form.mainImage || undefined,
              galleryImages: this.form.galleryImages.length ? this.form.galleryImages : undefined,
              colors: colors.length ? colors : undefined,
              sizes: sizes.length ? sizes : undefined,
              extraAttributes: extraAttributes.length ? extraAttributes : undefined,
            });
            this.$toast.add({ severity: "success", summary: "Atualizado", life: 2500 });
          } catch (e) {
            this.$toast.add({
              severity: "error",
              summary: "Produto",
              detail: e instanceof Error ? e.message : "Erro ao atualizar.",
              life: 4000,
            });
            return;
          }
        }
      } else {
        try {
          const created = productService.createLocal({
            name: this.form.name.trim(),
            price: Number(this.form.price),
            categoryId: this.form.categoryId!,
            description: this.form.description.trim() || undefined,
            stock: Number(this.form.stock),
            mainImage: this.form.mainImage || undefined,
            galleryImages: this.form.galleryImages.length ? this.form.galleryImages : undefined,
            colors: colors.length ? colors : undefined,
            sizes: sizes.length ? sizes : undefined,
            extraAttributes: extraAttributes.length ? extraAttributes : undefined,
          });
          this.rows = [
            { ...created, source: "Local" },
            ...this.rows.filter((row) => row.id !== created.id),
          ];
          this.$toast.add({ severity: "success", summary: "Produto criado", life: 2500 });
        } catch (e) {
          this.$toast.add({
            severity: "error",
            summary: "Produto",
            detail: e instanceof Error ? e.message : "Erro ao criar.",
            life: 4000,
          });
          return;
        }
      }
      this.dialogVisible = false;
      await this.reload();
    },
    confirmDelete(product: Product): void {
      this.$confirm.require({
        message: `Excluir "${product.name}"?`,
        header: "Confirmar exclusão",
        icon: "pi pi-exclamation-triangle",
        accept: async () => {
          try {
            if (product.localOnly) {
              productService.deleteLocal(product.id);
            } else {
              await productService.deleteRemote(product.id);
            }
            this.$toast.add({ severity: "success", summary: "Removido", life: 2500 });
            await this.reload();
          } catch (e) {
            this.$toast.add({
              severity: "error",
              summary: "Produto",
              detail: e instanceof Error ? e.message : "Erro ao remover.",
              life: 4000,
            });
          }
        },
      });
    },
  },
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold m-0">Produtos</h1>
        <p class="m-0 mt-1 text-sm text-gray-600 dark:text-gray-400">
          Cadastre produtos locais com categoria (select), imagens e atributos. Itens da API são somente leitura.
        </p>
      </div>
      <Button label="Novo produto local" icon="pi pi-plus" @click="openCreate" />
    </div>

    <Message v-if="categories.length === 0" severity="warn" :closable="false">
      Cadastre ao menos uma categoria em Admin → Categorias antes de criar produtos.
    </Message>

    <DataTable :value="rows" :loading="loading" paginator :rows="10" responsive-layout="scroll">
      <Column field="id" header="ID" />
      <Column header="Produto">
        <template #body="{ data }">
          <div class="flex items-center gap-3">
            <img
              :src="data.mainImage || data.thumbnail || 'https://via.placeholder.com/64x64?text=Sem+imagem'"
              :alt="data.name"
              class="h-12 w-12 object-contain rounded border border-gray-200 dark:border-gray-700 bg-white"
            />
            <div class="min-w-0">
              <div class="font-medium truncate">{{ data.name }}</div>
              <div class="text-xs text-gray-500 truncate">{{ data.category.title }}</div>
            </div>
          </div>
        </template>
      </Column>
      <Column header="Preço">
        <template #body="{ data }">
          {{ formatBRL(data.price) }}
        </template>
      </Column>
      <Column header="Categoria">
        <template #body="{ data }">
          {{ data.category.title }}
        </template>
      </Column>
      <Column field="source" header="Origem">
        <template #body="{ data }">
          <Tag :severity="data.source === 'Local' ? 'success' : 'info'" :value="data.source" />
        </template>
      </Column>
      <Column header="Ações" :exportable="false" style="min-width: 8rem">
        <template #body="{ data }">
          <Button
            v-if="data.localOnly"
            icon="pi pi-pencil"
            text
            rounded
            aria-label="Editar"
            @click="openEdit(data)"
          />
          <Button
            v-if="data.localOnly"
            icon="pi pi-trash"
            severity="danger"
            text
            rounded
            aria-label="Excluir"
            @click="confirmDelete(data)"
          />
          <span v-if="!data.localOnly" class="text-xs text-gray-500">Somente leitura</span>
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="dialogVisible"
      modal
      :header="editing ? 'Editar produto local' : 'Novo produto local'"
      class="w-[min(100%,36rem)]"
    >
      <div class="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-1">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">Categoria *</label>
          <select
            v-model.number="form.categoryId"
            class="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
            required
          >
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="pname">Nome</label>
          <InputText id="pname" v-model="form.name" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="pprice">Preço</label>
          <InputNumber id="pprice" v-model="form.price" mode="decimal" :min="0" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="pstock">Estoque</label>
          <InputNumber id="pstock" v-model="form.stock" :min="0" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="pcol">Cores (separadas por vírgula)</label>
          <InputText id="pcol" v-model="form.colorsStr" class="w-full" placeholder="Azul, Preto" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="psz">Tamanhos (separados por vírgula)</label>
          <InputText id="psz" v-model="form.sizesStr" class="w-full" placeholder="P, M, G" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="pex">Outras características (uma por vírgula)</label>
          <InputText id="pex" v-model="form.extrasStr" class="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">Imagem principal</label>
          <input type="file" accept="image/*" class="text-sm" @change="onMainImage" />
          <img
            v-if="form.mainImage"
            :src="form.mainImage"
            alt=""
            class="max-h-32 rounded border border-gray-200 dark:border-gray-600 object-contain"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium">Galeria (máx. 8 imagens)</label>
          <input type="file" accept="image/*" multiple class="text-sm" @change="onGallery" />
          <div class="flex flex-wrap gap-2">
            <div v-for="(g, idx) in form.galleryImages" :key="idx" class="relative">
              <img :src="g" alt="" class="h-20 w-20 object-cover rounded border" />
              <Button
                icon="pi pi-times"
                severity="danger"
                text
                rounded
                class="absolute! -top-1 -right-1"
                @click="removeGallery(idx)"
              />
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium" for="pdesc">Descrição</label>
          <Textarea id="pdesc" v-model="form.description" rows="3" class="w-full" auto-resize />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" severity="secondary" text @click="dialogVisible = false" />
        <Button label="Salvar" icon="pi pi-check" @click="save" />
      </template>
    </Dialog>
  </div>
</template>
