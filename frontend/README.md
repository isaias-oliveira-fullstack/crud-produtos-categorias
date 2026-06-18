# CRUD de Products e Categories com Repository, Service e Controller - Frontend

![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18-green?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-black?logo=express&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-Validation-purple?logo=zod)
![Controllers](https://img.shields.io/badge/Controllers-Express-blue)
![Middleware](https://img.shields.io/badge/Middleware-Validation-green)
![REST API](https://img.shields.io/badge/REST_API-RESTful-blue)
![Architecture](https://img.shields.io/badge/Architecture-Repository%20Service%20Controller-orange)
![Validation](https://img.shields.io/badge/Validation-Zod-purple)

O projeto frontend consome a API que implementa CRUD de Products e Categories com Repository, Service e Controller. Ele foi escrito com Vue 3, TypeScript, Pinia, Vuelidate, PrimeVue e Tailwind CSS para prover a interface enquanto a lógica de negócio permanece no backend.

## Últimas Funcionalidades Implementadas

### Galeria de Imagens com Seleção Visual
A página de detalhe do produto (`ProductDetailView.vue`) implementa:
- **Grid de miniaturas**: combina mainImage, thumbnail e galleryImages em um único grid de 4 colunas.
- **Seleção visual**: borda verde e ring ao clicar em uma miniatura.
- **Persistência**: a imagem de capa permanece visível entre as miniaturas.
- **Reatividade**: clique em miniatura atualiza selectedImage que reflete na imagem principal.

### Seletor de Cores com Swatch Colorido
Botões de cor exibem a cor real em vez de apenas texto:
- **Mapeamento de cores**: função cssColor() traduz nomes em português para valores CSS válidos.
- **Swatch visual**: cada cor é renderizada como um quadrado com backgroundColor colorido.
- **Borda de contraste**: pequena borda para visualizar cores claras.
- **Feedback de seleção**: ao selecionar, botão fica com fundo verde e texto branco.

## Destaques Principais

- **Autenticação centralizada**: estado gerenciado por store Pinia (authStore)
- **Validação de formulários**: login e registro com Vuelidate
- **Feedback visual**: Toast do PrimeVue com loading state
- **Roteamento protegido**: guards baseados em autenticação e papel do usuário
- **Layout responsivo**: consumidor, perfil e administrativo com Tailwind CSS
- **Galeria inteligente**: miniaturas combinadas e seleção de cores visual
- **Merge de dados**: produtos da API + localStorage para flexibilidade offline

## O que está incluído

- **Vue 3** com Options API
- **TypeScript** para tipagem estática
- **Pinia** para gerenciamento centralizado de estado
- **Vuelidate** para validação de formulários
- **PrimeVue** para componentes de interface
- **Tailwind CSS** para estilização responsiva
- **Vue Router 4** para navegação e proteção de rotas
- **Stores composables**: `authStore` como fonte única de verdade para autenticação

## Atividade Prática: Estruturação, Controladores e Validação com Zod

O frontend complementa a nova atividade do backend ao consumir uma API REST organizada por rotas, controllers e validação Zod. A camada de frontend foi estruturada para manter responsabilidades claras entre renderização, estado, navegação e integração com a API.

- `components/` fornecem blocos de interface reutilizáveis.
- `layouts/` apresentam shells de página para consumidor, perfil e administração.
- `views/` exibem páginas específicas e orquestram dados.
- `services/` encapsulam chamadas à API e tratam payloads.
- `stores/` mantêm o estado de autenticação e dados compartilhados.
- `router/` define rotas, guards e regras de acesso.

Essa organização garante que o frontend trate apenas da experiência do usuário e deixe a validação de dados de backend para os controllers e schemas implementados no servidor.

### Integração com o backend

O frontend consome uma API REST que segue a mesma filosofia de separação de responsabilidades: rotas claras, controllers responsáveis pela lógica de negócio e schemas Zod para validar dados em `body`, `query` e `params`. Isso torna o fluxo de dados previsível e reduz o acoplamento entre frontend e backend.

## Funcionalidades principais

- **Autenticação centralizada**: login e registro com validação Vuelidate
- **Feedback visual**: Toast para sucesso/erro e loading state durante operações
- **Store Pinia**: `authStore` como fonte única de estado de autenticação
- Página inicial com vitrine de produtos
- Detalhes do produto em rota dinâmica `/product/:id`
- Carrinho de compras e checkout com validação
- Rotas de autenticação: login e registro
- Área de perfil com rotas filhas (dashboard, edição, pedidos, favoritos, tracking)
- Área administrativa com dashboard, produtos, categorias, pedidos, usuários, relatórios e configurações
- Proteção de rotas usando `beforeEach` com guards
- Navegação com `router-link` e `Menubar` do PrimeVue
- Breadcrumbs dinâmicos para orientação do usuário

## Autenticação centralizada com Pinia

O `authStore` (`src/stores/auth.ts`) centraliza todo o estado de autenticação:

```typescript
export const useAuthStore = defineStore("auth", () => {
  const user = ref<any>(authService.getCurrentUser());
  const loading = ref(false);
  const isAuthenticated = computed(() => user.value !== null);
  const isAdmin = computed(() => user.value?.role === "ADMIN");

  async function login(email: string, password: string) {
    loading.value = true;
    // retorna { ok: true, user } ou { ok: false, error }
  }

  async function register(payload) {
    loading.value = true;
    // valida dados e cria novo usuário
  }

  function logout() {
    user.value = null;
  }

  return { user, loading, isAuthenticated, isAdmin, login, register, logout };
});
```

Todas as views usam `useAuthStore()` como fonte única:

```typescript
const auth = useAuthStore();
if (auth.isAuthenticated) {
  // usuário autenticado
}
```

## Validação com Vuelidate

Formulários de login e registro incluem validação em tempo real:

- Email obrigatório e formato válido
- Senha obrigatória com mínimo 6 caracteres
- Nome obrigatório para registro
- Mensagens de erro específicas abaixo de cada campo
- Botão de submit desabilitado até validação passar

## Feedback visual com PrimeVue Toast

Operações de autenticação exibem feedback contextual:

- Mensagens de sucesso ao fazer login/registro
- Mensagens de erro para credenciais inválidas
- Loading state durante requisições assíncronas
- Redirecionamento automático após sucesso

## Arquitetura de rotas

As rotas estão definidas em `src/router/index.ts`.

### Rotas do consumidor

- `/` -> `HomeView`
- `/products` -> `ProductsView`
- `/products/:category` -> filtros por categoria
- `/product/:id` -> `ProductDetailView` (rota dinâmica)
- `/cart` -> `CartView`
- `/checkout` -> `CheckoutView`
- `/order-success` -> `OrderSuccessView`
- `/login` e `/register`
- `/profile/*` -> rotas filhas do perfil

### Rotas administrativas

- `/admin/dashboard`
- `/admin/products`
- `/admin/categories`
- `/admin/orders`
- `/admin/users`
- `/admin/reports`
- `/admin/settings`

### Rota de fallback

- `/:pathMatch(.*)*` -> `NotFoundView`

## Layouts

### Consumidor

O `ConsumerLayout.vue` mantém o cabeçalho e o acesso ao carrinho visíveis a cada troca de página.
Isso garante que o fluxo de compras seja contínuo e que o usuário tenha navegação rápida entre as seções.

### Administrador

O `AdminLayout.vue` apresenta estrutura de dashboard com menu lateral e rotas filhas para organização das páginas administrativas.
A separação visual ajuda a distinguir claramente a área de gestão da área de compra.

### Perfil

O `ProfileLayout.vue` agrupa as rotas do perfil do usuário em um layout comum, com navegação e breadcrumbs próprios.

## Segurança e guards

A validação de acesso é feita em `src/router/index.ts` usando `router.beforeEach` com o `authStore`:

- `requiresAdmin` garante que apenas usuários com perfil ADMIN acessem `/admin/*`.
- `requiresAuth` protege páginas que exigem login como `/profile/*` e `/order-success`.
- `requiresCheckout` valida o fluxo de checkout e impede acesso direto se o carrinho não estiver válido.
- `guestOnly` redireciona usuários autenticados de volta para home quando tentam acessar `/login` ou `/register`.

Os guards consultam `useAuthStore()` como fonte única de verdade:

```typescript
router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: "login" });
  } else if (to.meta.requiresAdmin && !auth.isAdmin) {
    next({ name: "home" });
  } else {
    next();
  }
});
```

## Separação de responsabilidades no frontend

O frontend foi estruturado seguindo uma arquitetura em camadas, com diferenças claras entre:

- `layouts/`: estruturas de página e navegação para cada área da aplicação.
- `views/`: páginas específicas responsáveis pela renderização e interação do usuário.
- `components/`: blocos visuais reutilizáveis e isolados.
- `services/`: comunicação com a API REST e transformação de payloads.
- `stores/`: estado global, autenticação e dados compartilhados.
- `router/`: definição de rotas, metadata e guards de acesso.

### Boas práticas adotadas

- Separação de lógica de apresentação e lógica de dados.
- Requisições a backend centralizadas em `src/services`.
- Validação local de formulários com Vuelidate antes do envio.
- Tratamento de erros de API com Toasts informativos.
- Rotas protegidas por metadados e guardas de navegação.

### Organização de pastas

A estrutura do `frontend/src/` segue o padrão:

- `components/` para componentes reutilizáveis
- `layouts/` para shells de página e navegação
- `stores/` para gerenciamento centralizado de estado
- `router/` para rotas e guards
- `services/` para comunicação com a API
- `views/` para páginas e fluxos do usuário

## Recursos PrimeVue usados

- `Menubar` para navegação principal
- `DataTable` para listagens administrativas
- `Breadcrumb` para exibir caminho das rotas
- `Button`, `Card`, `InputNumber` e outros componentes de formulários e listas

## Estrutura do frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── AppBreadcrumb.vue
│   │   ├── EmptyCart.vue
│   │   └── ProductCard.vue
│   ├── layouts/
│   │   ├── AdminLayout.vue
│   │   ├── ConsumerLayout.vue
│   │   └── ProfileLayout.vue
│   ├── stores/
│   │   └── auth.ts
│   ├── router/
│   │   └── index.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── cartService.ts
│   │   ├── orderService.ts
│   │   └── storageKeys.ts
│   ├── views/
│   │   ├── AdminDashboardView.vue
│   │   ├── AdminProductsView.vue
│   │   ├── CartView.vue
│   │   ├── CheckoutView.vue
│   │   ├── HomeView.vue
│   │   ├── LoginView.vue
│   │   ├── ProductDetailView.vue
│   │   └── RegisterView.vue
│   ├── App.vue
│   ├── main.ts
│   └── style.css
├── package.json
└── tsconfig.json
```
## Como executar

No diretório `frontend`:

```bash
cd frontend
npm install
npm run dev
```

Abra o endereço exibido pelo Vite no navegador.

## Observação

Este frontend implementa a **Atividade Prática: Roteamento REST com Express e TypeScript**, com:

- **Pinia**: store centralizado (`authStore`) para estado de autenticação
- **Vuelidate**: validação de formulários de login e registro
- **PrimeVue**: componentes de UI, Toast e feedback visual
- **Tailwind CSS**: estilização responsiva
- **Vue Router**: guards baseados em autenticação e papel do usuário
- **Loading state**: indicadores visuais durante operações
- **Múltiplas áreas**: consumidor, perfil e administrativo com layouts separados
