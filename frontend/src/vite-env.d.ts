/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

import "vue";

declare module "vue" {
  interface ComponentCustomProperties {
    $confirm: {
      require: (options: { message: string; accept: () => void }) => void;
    };
  }
}