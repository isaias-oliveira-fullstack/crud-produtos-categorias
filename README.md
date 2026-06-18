# CRUD de Products e Categories com Repository, Service e Controller

![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18-green?logo=node.js&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-3-green?logo=vue.js)
![Pinia](https://img.shields.io/badge/Pinia-2-ffd859?logo=vue.js&logoColor=black)
![Vuelidate](https://img.shields.io/badge/Vuelidate-2-4DBA87?logo=vue.js&logoColor=white)
![PrimeVue](https://img.shields.io/badge/PrimeVue-4-00bcd4?logo=vue.js&logoColor=white)
![Vue Router](https://img.shields.io/badge/Vue_Router-4-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)
![Express](https://img.shields.io/badge/Express-4-black?logo=express&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-Validation-purple?logo=zod)
![REST API](https://img.shields.io/badge/REST_API-RESTful-blue)
![Architecture](https://img.shields.io/badge/Architecture-Repository%20Service%20Controller-orange)
![Status Code](https://img.shields.io/badge/Status_Code-200%2C400%2C401%2C403%2C404%2C500-green)
![HTTP Verb](https://img.shields.io/badge/HTTP_Verb-GET%2CPOST%2CPUT%2CDELETE-yellow)
![CRUD](https://img.shields.io/badge/CRUD-Complete-success)
![Gallery](https://img.shields.io/badge/Gallery-Image%20Grid%20Thumbnails-blueviolet)
![Color Picker](https://img.shields.io/badge/Color%20Picker-Visual%20Swatch-ff69b4)
![Slugs](https://img.shields.io/badge/Slugs-Auto%20Generated-cc6600)
![Entity](https://img.shields.io/badge/Entity-Category%2C%20Product-9932cc)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-estudo-blue)

## Atividade Prática

Este projeto foi desenvolvido para consolidar a arquitetura de CRUD de Products e Categories usando Repository, Service e Controller. A ideia é aplicar a separação de responsabilidades da aula: repositories cuidam de persistência, services cuidam da lógica de negócio e controllers cuidam da entrada HTTP e da validação.

A aplicação gerencia produtos e categorias por meio de endpoints REST, com validação de `body`, `query` e `params` via Zod, autenticação/authorization para rotas de escrita, e tratamento de erros centralizado.

### Estruturação da aplicação

A arquitetura adotada separa claramente as responsabilidades em camadas distintas:

- `routes/` define os caminhos da API e associa cada endpoint ao controller certo.
- `controllers/` contêm a lógica de processo, regras de negócio e construção das respostas.
- `schemas/` armazenam os esquemas Zod que validam entrada de `body`, `query` e `params`.
- `middlewares/` realizam validação, tratamento de erros e pré-processamento antes do controller.
- `models/` ou `data/` representam a estrutura dos recursos utilizados pela API.

### Fluxo de requisição

O fluxo padrão de uma requisição é:

1. O router identifica a rota e invoca o middleware apropriado.
2. O middleware valida os dados de `req.body`, `req.params` ou `req.query` usando Zod.
3. Se a validação falhar, a requisição é interrompida com `400 Bad Request`.
4. Se os dados estiverem válidos, o controller recebe informações limpas e tipadas.
5. O controller executa a regra de negócio e retorna a resposta HTTP adequada.

Essa separação garante que a aplicação seja mais segura, mais fácil de testar e mais previsível em produção.

Além das operações de consulta, criação, atualização e cancelamento de recursos, a solução também utiliza middlewares para registro de logs das requisições e validação dos dados recebidos com Zod. As funcionalidades foram organizadas em routers independentes para Categorias, Produtos e Pedidos, promovendo uma estrutura mais limpa, modular e de fácil manutenção, onde cada camada tem responsabilidades bem definidas.

### Consolidando Categorias (/category)

A entidade de categorias foi estruturada seguindo o padrão de separação de camadas:

**Paginação Segura (GET /api/category)**
- Utiliza `categoryQueryPaginationSchema` para validar a Query String
- O controller lê `req.query` (page, size) e valida com Zod
- Garante que page e size sejam números válidos e positivos
- Retorna resposta paginada: `{ categories, page, size, total }`

**Validação de ID (GET, PUT, DELETE)**
- Nas rotas que recebem `/:id`, utiliza `categoryParamsSchema`
- Valida se o ID passado nos parâmetros (`req.params`) é um UUID autêntico antes de processar qualquer lógica
- Retorna `400 Bad Request` em caso de falha na validação
- Retorna `404 Not Found` se a categoria não existe

**Criação Estrita (POST /api/category)**
- Utiliza `createCategorySchema` que exige:
  - `name`: string com mínimo de 3 caracteres
- Tente enviar apenas 2 caracteres? O sistema barra com erro de validação
- Retorna `201 Created` com a categoria criada

**Fluxo de Produtos (/products)**

A estrutura de produtos segue o mesmo padrão de separação, garantindo consistência:

**Schema de Validação (Zod)**
- Arquivo: `src/schemas/product.schema.ts`
- Esquema de criação exige:
  - `name`: string com mínimo de 3 caracteres
  - `price`: número positivo
  - `categoryId`: string que deve ser um UUID válido, referenciando a categoria

**Criação de Produto (POST /api/products)**
- Valida o `req.body` contra `createProductSchema`
- Usa `.safeParse()` para validação segura
- Gera novo ID auto-incrementado
- Retorna `201 Created` com o produto criado
- Retorna `400 Bad Request` se dados inválidos

**Listagem e Filtros (GET /api/products)**
- Lista todos os produtos ou filtra por categoria
- Suporta Query String `?category=id_da_categoria` ou `?category=nome_categoria`, dependendo da implementação de filtragem
- Aplica slug matching para compatibilidade e flexibilidade de busca
- Retorna: `{ products, total, skip, limit }`

**Rota Especializada (GET /api/products/category/:slug)**
- Filtra produtos por slug da categoria
- Útil para navegação por categorias no frontend
- Retorna lista paginada de produtos

**Deleção Segura (DELETE /api/products/:id)**
- Valida o ID com `productParamsSchema`
- Remove o produto se existir
- Retorna `204 No Content` (padrão REST para sucesso sem resposta)
- Retorna `404 Not Found` se produto não existe

**Seção Desafio: Middleware de Validação**

**Reaproveitamento de Código com Middleware Factory**

Arquivo: `src/middlewares/validateData.ts`

Elimina repetição nos controllers com um middleware genérico:

```typescript
export function validateData(schema: AnyZodObject, property: "body" | "query" | "params") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[property]);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.format() });
    }
    req[property] = result.data as any;
    return next();
  };
}
```

**Benefícios:**
- Controllers ficam 70% mais enxutos (sem validação inline)
- Validação centralizada e consistente
- Tratamento de erros padronizado (sempre retorna 400)
- Fácil de reutilizar em qualquer rota
- Dados validados chegam limpos no controller

**Uso em Rotas:**
```typescript
router.post(
  "/",
  validateData(createProductSchema, "body"),  // Valida body
  productController.create                     // Controller recebe dados limpos
);

router.put(
  "/:id",
  validateData(productParamsSchema, "params"),  // Valida params
  validateData(createProductSchema, "body"),    // Valida body
  productController.update
);
```

### Papel dos Controllers e Responsabilidade das Rotas

- `Rotas` devem ser responsáveis apenas por mapear URLs para controllers e passar os dados corretamente.
- `Controllers` têm o papel de receber os dados validados, executar regras de negócio, chamar serviços e construir a resposta.
- `Middlewares` devem capturar e validar a entrada antes que qualquer lógica de negócio seja executada.

### Validação com Zod

A validação com Zod oferece duas vantagens principais:

- Garante que os dados entregues ao controller já estejam limpos e tipados.
- Retorna erros claros e mapeados quando os dados não cumprem as regras.

Com `schema.safeParse()`, o middleware consegue interromper o fluxo e responder com `400 Bad Request` antes que o controller seja chamado.

### Segurança e integridade dos dados

A camada de validação protege a API contra dados sujos, garantindo que campos obrigatórios, tipos e formatos estejam corretos antes de qualquer operação de criação, atualização ou exclusão. Essa proteção é especialmente importante para evitar falhas no backend e manter a integridade dos recursos.

### Benefícios para a aplicação

- Controllers mais limpos e de fácil leitura.
- Validação centralizada e reutilizável.
- Maior segurança contra payloads malformados.
- Melhor organização da aplicação em camadas.

### Controle de fluxo e tratamento de erros

Quando há falha de validação, o middleware devolve `400` com os detalhes dos erros.
Quando um recurso não é encontrado, o controller devolve `404`.
Isso mantém o contrato REST consistente e facilita o consumo da API.

### Critérios para a Entrega

**1. Organização - Camadas Separadas**
- Rotas (routers) em `src/routes/` — apenas orquestração
- Controladores (controllers) em `src/controllers/` — lógica de negócio
- Validações (schemas) em `src/schemas/` — regras Zod
- Middleware em `src/middlewares/` — interceptação de requisições

**2. Validação Total - Zod como Porteiro**
- Nenhuma requisição POST/PUT passa sem validação
- Dados inválidos → 400 Bad Request com detalhes do erro
- Dados válidos → Chegam limpos e tipados no controller
- Mensagens de erro mapeadas no Zod (min, max, format)

**3. Semântica REST e Status Codes**
- GET → Retorna 200 OK
- POST → Retorna 201 Created
- PUT → Retorna 200 OK
- PATCH → Retorna 200 OK
- DELETE → Retorna 204 No Content
- Erros de validação → 400 Bad Request
- Recurso não encontrado → 404 Not Found

### Objetivos principais

- Centralizar estado de autenticação em um store Pinia (`authStore`).
- Validar formulários de login e registro com Vuelidate.
- Implementar feedback visual com Toast do PrimeVue.
- Exibir loading state durante operações assíncronas.
- Proteger rotas com guards baseados em autenticação e papel do usuário.
- Criar layouts responsivos com Tailwind CSS.
- Implementar experiência de consumidor, perfil e administrativa com navegação segura.
- Consumir API de produtos e categorias integrada com backend REST com validação Zod.

## Descrição do projeto

A aplicação simula uma plataforma de e-commerce desenvolvida com Vue 3, TypeScript e Options API no frontend, integrada a um backend em Express e TypeScript por meio de uma API REST. O backend é disponibilizado através de funções serverless na Vercel, permitindo uma arquitetura leve e escalável para o gerenciamento de produtos e pedidos, seguindo boas práticas de desenvolvimento full stack e organização de aplicações web.

**O projeto inclui:**

- **Autenticação centralizada** em `frontend/src/stores/auth.ts`.
- **Validação segura** de login e cadastro com Vuelidate.
- **Feedback visual** com Toast do PrimeVue.
- **Roteamento protegido** por guards de autenticação e autorização.
- **Catálogo híbrido**: produtos de API mesclados com produtos locais em `localStorage`.
- **Backend serverless** em `api/`, com lógica de rota compartilhada em `src/`.
- **Área administrativa** com gestão de produtos locais e visualização de dados.
- **Layouts separados** para consumidor, admin e perfil.

## Centralização de autenticação com Pinia

O `authStore` (`frontend/src/stores/auth.ts`) é a fonte única de verdade para autenticação:

```ts
export const useAuthStore = defineStore("auth", () => {
  const user = ref<any>(authService.getCurrentUser());
  const token = ref<string | null>(null);
  const loading = ref(false);
  const isAuthenticated = computed(() => user.value !== null);
  const isAdmin = computed(() => user.value?.role === "ADMIN");

  async function login(email: string, password: string) {
    loading.value = true;
    const res = authService.login(email, password);
    if (res.ok) {
      user.value = res.user;
      token.value = "fake-token";
    }
    loading.value = false;
    return res;
  }

  async function register(payload) {
    loading.value = true;
    const res = authService.register(payload);
    if (res.ok) {
      authService.login(payload.email, payload.password);
      user.value = res.user;
      token.value = "fake-token";
    }
    loading.value = false;
    return res;
  }

  function logout() {
    authService.logout();
    user.value = null;
    token.value = null;
  }

  return { user, token, loading, isAuthenticated, isAdmin, login, register, logout };
});
```

Todas as views acessam autenticação via `useAuthStore()`.

## Validação com Vuelidate

Formulários de login e registro validam campos em tempo real:

- **Email**: obrigatório e formato válido.
- **Senha**: obrigatório e mínimo de 6 caracteres.
- **Nome**: obrigatório no registro.
- Exibição de mensagens de erro abaixo de cada campo.
- Botão de submit desabilitado até a validação passar.

## Feedback visual com PrimeVue Toast

Operações de autenticação e cadastro exibem feedback em tempo real:

- **Sucesso**: login/cadastro bem-sucedido.
- **Erro**: credenciais inválidas ou campos obrigatórios ausentes.
- **Loading**: spinner durante a operação.

## Arquitetura de rotas

As rotas estão definidas em `frontend/src/router/index.ts`.

Rotas do consumidor:

- `/` -> `HomeView`
- `/products` -> `ProductsView`
- `/products/:category` -> `ProductsView`
- `/product/:id` -> `ProductDetailView`
- `/cart` -> `CartView`
- `/checkout` -> `CheckoutView`
- `/order-success` -> `OrderSuccessView`
- `/login` -> `LoginView`
- `/register` -> `RegisterView`
- `/profile/*` -> `ProfileLayout` e views de perfil

Rotas administrativas:

- `/admin/dashboard`
- `/admin/products`
- `/admin/categories`
- `/admin/orders`
- `/admin/users`
- `/admin/reports`
- `/admin/settings`

Rota de fallback:

- `/:pathMatch(.*)*` -> `NotFoundView`

## Navegação e layouts

A navegação é feita com `router-link` e componentes PrimeVue.

### Layout do consumidor

`ConsumerLayout.vue` mantém cabeçalho e carrinho visíveis entre páginas.

### Layout administrativo

`AdminLayout.vue` apresenta menu lateral e rotas filhas para organização.

## Guards e proteção de acesso

O `router.beforeEach` aplica proteção com base em `authStore`:

- `requiresAdmin` protege `/admin/*`.
- `requiresAuth` protege `/order-success` e `/profile/*`.
- `requiresCheckout` impede checkout com carrinho vazio.
- `guestOnly` redireciona usuários logados de `/login` e `/register`.

## Seção desafio: experiência administrativa

A área administrativa usa PrimeVue para gestão de dados:

- `DataTable` para listagens.
- `Breadcrumb` para navegação.
- Rotas filhas para separar funcionalidades.

### Exemplos implementados

- `AdminProductsView.vue` usa `DataTable`.
- `AdminCategoriesView.vue`, `AdminOrdersView.vue` e `AdminUsersView.vue` usam tabelas.
- `AppBreadcrumb.vue` exibe breadcrumbs dinâmicos.

## Backend REST API

A API é exposta como funções serverless em `api/`, usando `src/` para rotas, modelos e middlewares compartilhados.

- `api/products.ts` — função serverless de produtos.
- `api/orders.ts` — função serverless de pedidos.
- `src/routes/products.ts` — rota de produtos e filtros.
- `src/routes/orders.ts` — rota de pedidos.
- `src/middlewares/logger.ts` — middleware de log.
- `src/middlewares/validateBody.ts` — validação de body.

### Semântica REST e status code

A API usa verbos HTTP para descrever operações:

- `GET` para recuperar recursos.
- `POST` para criar pedidos.
- `PATCH` para atualizar pedidos parcialmente.
- `DELETE` para remover pedidos.

Os endpoints retornam status codes semânticos como:

- `200 OK` em requisições bem-sucedidas.
- `201 Created` em criação de recursos.
- `400 Bad Request` em dados inválidos.
- `404 Not Found` quando o recurso não existe.
- `500 Internal Server Error` em erros de servidor inesperados.

### Endpoints principais

- `GET /api/products`
- `GET /api/products/category/:slug`
- `GET /api/products/:id`
- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PATCH /api/orders/:id`
- `DELETE /api/orders/:id`

## Produto e catálogo

O `frontend/src/services/productService.ts` mapeia produtos da API e produtos locais:

- usa `title` ou `name` como nome do produto
- usa placeholder quando não há `thumbnail`
- retorna categorias locais via `categoryService`
- combina dados da API com produtos locais

## Últimas Funcionalidades Implementadas

### Galeria de Imagens com Seleção Visual

A página de detalhe do produto implementa uma galeria completa com miniaturas:

- **Miniaturas unificadas**: Exibe `mainImage`, `thumbnail` e todas as imagens de `galleryImages` em um grid de 4 colunas.
- **Imagem destacada**: Ao clicar em uma miniatura, ela fica marcada com borda verde e ring, indicando seleção.
- **Persistência visual**: A imagem de capa (`mainImage`) permanece entre as miniaturas e não desaparece ao selecionar outras.
- **Computada `allImages`**: A Vue data property usa um `computed` para combinar e dedplicar as imagens.
- **Arquivo**: `frontend/src/views/ProductDetailView.vue` — seção template com `v-for="(g, idx) in allImages"`.

### Seletor de Cores com Swatch Visual

Os botões de cor agora exibem a cor real em vez de apenas texto:

- **Swatch colorido**: Cada cor é renderizada como um quadrado com `backgroundColor` CSS.
- **Mapeamento de cores em português**: A função `cssColor(value)` traduz nomes em português ("azul", "vermelho", etc.) para valores CSS válidos.
- **Borda para contraste**: Pequena borda `border-gray-300` ajuda a visualizar cores claras (como branco).
- **Acessibilidade**: Atributos `title` e `aria-label` com o nome da cor.
- **Arquivo**: `frontend/src/views/ProductDetailView.vue` — método `cssColor()` e template do seletor.

## Estrutura do projeto

```
crud-produtos-categorias/
├── api/
│   ├── orders.ts
│   └── products.ts
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AppBreadcrumb.vue
│   │   │   ├── EmptyCart.vue
│   │   │   └── ProductCard.vue
│   │   ├── layouts/
│   │   │   ├── AdminLayout.vue
│   │   │   ├── ConsumerLayout.vue
│   │   │   └── ProfileLayout.vue
│   │   ├── router/
│   │   │   └── index.ts
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── cartService.ts
│   │   │   ├── categoryService.ts
│   │   │   ├── favoritesService.ts
│   │   │   ├── orderService.ts
│   │   │   ├── productService.ts
│   │   │   ├── storageKeys.ts
│   │   │   └── storeSettingsService.ts
│   │   ├── stores/
│   │   │   └── auth.ts
│   │   ├── utils/
│   │   │   ├── brValidation.ts
│   │   │   ├── csv.ts
│   │   │   ├── format.ts
│   │   │   ├── orderLabels.ts
│   │   │   └── whatsapp.ts
│   │   ├── views/
│   │   │   ├── AdminCategoriesView.vue
│   │   │   ├── AdminDashboardView.vue
│   │   │   ├── AdminOrdersView.vue
│   │   │   ├── AdminProductsView.vue
│   │   │   ├── AdminReportsView.vue
│   │   │   ├── AdminSettingsView.vue
│   │   │   ├── AdminUsersView.vue
│   │   │   ├── CartView.vue
│   │   │   ├── CheckoutView.vue
│   │   │   ├── HomeView.vue
│   │   │   ├── LoginView.vue
│   │   │   ├── NotFoundView.vue
│   │   │   ├── OrderSuccessView.vue
│   │   │   ├── ProductDetailView.vue
│   │   │   ├── ProductsView.vue
│   │   │   ├── ProfileDashboardView.vue
│   │   │   ├── ProfileEditView.vue
│   │   │   ├── ProfileFavoritesView.vue
│   │   │   ├── ProfileOrdersView.vue
│   │   │   ├── ProfileTrackingView.vue
│   │   │   └── RegisterView.vue
│   │   ├── App.vue
│   │   ├── main.ts
│   │   └── style.css
│   ├── package.json
│   └── tsconfig.json
├── src/
│   ├── classes/
│   │   ├── Cart.ts
│   │   └── User.ts
│   ├── controllers/
│   │   ├── category.controller.ts
│   │   ├── orders.controller.ts
│   │   └── product.controller.ts
│   ├── dtos/
│   │   ├── category.dto.ts
│   │   └── product.dto.ts
│   ├── entities/
│   │   ├── CategoryEntity.ts
│   │   └── ProductEntity.ts
│   ├── middlewares/
│   │   ├── authMiddleware.ts
│   │   ├── authorize.ts
│   │   ├── errorHandler.ts
│   │   ├── logger.ts
│   │   ├── validateBody.ts
│   │   └── validateData.ts
│   ├── models/
│   │   ├── CartItem.ts
│   │   ├── Category.ts
│   │   ├── LocalCategory.ts
│   │   ├── Order.ts
│   │   ├── PaymentSettings.ts
│   │   ├── Product.ts
│   │   ├── StoreSettings.ts
│   │   └── UserRecord.ts
│   ├── repositories/
│   │   ├── category.repository.ts
│   │   ├── index.ts
│   │   └── product.repository.ts
│   ├── routes/
│   │   ├── category.ts
│   │   ├── orders.ts
│   │   └── product.ts
│   ├── schemas/
│   │   ├── category.schema.ts
│   │   ├── category.schemas.ts
│   │   ├── orders.schema.ts
│   │   ├── product.schema.ts
│   │   └── product.schemas.ts
│   ├── services/
│   │   ├── category.service.ts
│   │   └── product.service.ts
│   ├── utils/
│   │   ├── HttpError.ts
│   │   └── hashId.ts
│   └── index.ts
├── .env.example
├── .gitignore
├── LICENSE
├── package-lock.json
├── package.json
├── README.md
├── tsconfig.json
├── vercel.json
└── vite.json
```

## Tecnologias utilizadas

- **Vue 3** com Options API
- **TypeScript**
- **Pinia**
- **Vuelidate**
- **PrimeVue**
- **Tailwind CSS**
- **Vue Router 4**
- **Vite**
- **Express**
- **Zod**

## Como executar o projeto

### Clone o repositório

```bash
git clone https://github.com/isaias-oliveira-fullstack/crud-produtos-categorias.git
```

### Entre na pasta do projeto

```bash
cd crud-produtos-categorias
```

### Instale as dependências

```bash
npm install
cd frontend
npm install
```

### Execute o backend local

```bash
npm run build
npm start
```

### Execute o frontend

```bash
cd frontend
npm run dev
```

Abra no navegador o endereço informado pelo Vite.

### Build de produção

```bash
cd frontend
npm run build
npm run preview
```

Acesse a aplicação no navegador no endereço exibido pelo Vite.
(geralmente `http://localhost:5173`).

## Arquitetura de Camadas (Backend)

O backend segue uma arquitetura em camadas rigorosamente separadas, garantindo responsabilidades bem definidas e código limpo:

### 1. **Camada de Schemas (Validação com Zod)**

Localização: `src/schemas/`

Todos os dados de entrada são validados usando **Zod** antes de chegar aos controladores:

```typescript
// src/schemas/product.schema.ts
export const createProductSchema = z.object({
  name: z.string().min(3, { message: "name must have at least 3 characters" }),
  price: z.number().positive({ message: "price must be a positive number" }),
  categoryId: z.number().int().positive({ message: "categoryId must be a positive integer" }),
});

export const productParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
```

**Validações por entidade:**
- **Categories**: `categoryParamsSchema`, `categoryQueryPaginationSchema`, `createCategorySchema`
- **Products**: `productParamsSchema`, `createProductSchema`
- **Orders**: Validação via middleware `validateOrderBody`

### 2. **Middleware de Validação**

Localização: `src/middlewares/validateData.ts`

Factory pattern que reduz boilerplate e centraliza tratamento de erros:

```typescript
export function validateData(schema: AnyZodObject, property: "body" | "query" | "params") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[property]);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.format() });
    }
    req[property] = result.data as any;
    return next();
  };
}
```

**Garantia**: Nenhum dado inválido atinge os controladores.

### 3. **Camada de Controladores (Lógica de Negócio)**

Localização: `src/controllers/`

Controladores encapsulam toda a lógica de negócio, separada de roteamento e validação:

```typescript
// src/controllers/product.controller.ts
export const productController = {
  list: (req: Request, res: Response) => {
    // Filtragem, paginação, resposta formatada
  },
  
  create: (req: Request, res: Response) => {
    // Lógica de criação com status 201
    return res.status(201).json(product);
  },
  
  delete: (req: Request, res: Response) => {
    // Lógica de deleção com status 204
    return res.sendStatus(204);
  },
};
```

**Controladores disponíveis:**
- `categoryController` (5 métodos: list, getById, create, update, delete)
- `productController` (5 métodos: list, listByCategorySlug, getById, create, delete)
- `ordersController` (5 métodos: list, getById, create, update, delete)

### 4. **Camada de Rotas**

Localização: `src/routes/`

Rotas orquestram middleware de validação + controladores, sem lógica de negócio:

```typescript
// src/routes/product.ts
productRouter.post(
  "/",
  validateData(createProductSchema, "body"),  // Validação
  productController.create                     // Lógica
);

productRouter.delete(
  "/:id",
  validateData(productParamsSchema, "params"), // Validação
  productController.delete                     // Lógica
);
```

---

## Validação Total com Zod

Todo endpoint com **POST** ou **PUT** valida dados automaticamente:

| Endpoint | Validação | Schema |
|----------|-----------|--------|
| `POST /api/products` | Body | `createProductSchema` |
| `POST /api/category` | Body | `createCategorySchema` |
| `PUT /api/category/:id` | Params + Body | `categoryParamsSchema` + `createCategorySchema` |
| `DELETE /api/products/:id` | Params | `productParamsSchema` |
| `POST /api/orders` | Body | `validateOrderBody` |

**Comportamento:**
- Dados válidos → Prosseguem para o controlador
- Dados inválidos → Retornam `400 Bad Request` com detalhes do erro

---

## Semântica REST e Status Codes

O projeto implementa semântica HTTP corretamente em todos os endpoints:

### Verbos HTTP

| Verbo | Operação | Exemplo |
|-------|----------|---------|
| **GET** | Recuperar | `GET /api/products` |
| **POST** | Criar | `POST /api/products` |
| **PUT** | Substituir | `PUT /api/category/:id` |
| **PATCH** | Atualizar Parcial | `PATCH /api/orders/:id` |
| **DELETE** | Remover | `DELETE /api/products/:id` |

### Status Codes de Resposta

| Status | Significado | Exemplo |
|--------|-------------|---------|
| **200** | OK | GET bem-sucedido, PUT bem-sucedido |
| **201** | Created | `POST /api/products` cria novo produto |
| **204** | No Content | `DELETE /api/products/:id` remove com sucesso |
| **400** | Bad Request | Validação Zod falha |
| **404** | Not Found | Recurso não existe |

**Exemplos no código:**

```typescript
// 201 CREATED
create: (req: Request, res: Response) => {
  const product: ProductEntity = { ... };
  products.push(product);
  return res.status(201).json(product);
}

// 204 NO CONTENT
delete: (req: Request, res: Response) => {
  products.splice(index, 1);
  return res.sendStatus(204);
}

// 404 NOT FOUND
getById: (req: Request, res: Response) => {
  const product = products.find((item) => item.id === productId);
  if (!product) {
    return res.status(404).json({ message: "Produto não encontrado." });
  }
  return res.json(product);
}

// 400 BAD REQUEST (via Zod middleware)
if (!result.success) {
  return res.status(400).json({ errors: result.error.format() });
}
```

---

## Observações

O projeto entrega um backend REST com tratamento de status e validações, ao mesmo tempo em que o frontend atual usa autenticação segura, categorias locais e experiência administrativa.

## Contribuição

Se quiser contribuir com feedback ou sugestões, fique à vontade para abrir uma **[Issue](https://github.com/isaias-oliveira-fullstack/crud-produtos-categorias/issues)** ou **[enviar ideias](https://github.com/isaias-oliveira-fullstack/crud-produtos-categorias/pulls)**. 

## Licença

Este projeto está licenciado sob a **Licença MIT**.

Veja o arquivo **[LICENSE](./LICENSE)** para mais detalhes.

## Autor

Projeto desenvolvido por **Isaias Oliveira**.  
Conecte-se comigo no **[in/isaias-oliveira-dev](https://www.linkedin.com/in/isaias-oliveira-dev/)**
