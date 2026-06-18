import { createApp } from "vue";
import PrimeVue from "primevue/config";
import Aura from "@primeuix/themes/aura";
import ConfirmationService from "primevue/confirmationservice";
import Avatar from 'primevue/avatar';
import Menubar from 'primevue/menubar';
import ToastService from "primevue/toastservice";
import Card from "primevue/card";
import Button from "primevue/button";
import InputNumber from "primevue/inputnumber";
import DataView from "primevue/dataview";
import ConfirmDialog from "primevue/confirmdialog";
import Toast from "primevue/toast";
import Skeleton from "primevue/skeleton";
import Message from "primevue/message";
import Divider from "primevue/divider";
import Textarea from "primevue/textarea";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Dialog from "primevue/dialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Tag from "primevue/tag";
import RadioButton from "primevue/radiobutton";
import Checkbox from "primevue/checkbox";
import "primeicons/primeicons.css";
import "./style.css";
import App from "./App.vue";
import { router } from "./router";
import { createPinia } from "pinia";
import { authService } from "./services/authService";
import { storeSettingsService } from "./services/storeSettingsService";
import { categoryService } from "./services/categoryService";

import Breadcrumb from 'primevue/breadcrumb';
import AppBreadcrumb from "./components/AppBreadcrumb.vue";

authService.init();
storeSettingsService.init();
void categoryService.seedFromApiIfEmpty();

const app = createApp(App);

app.use(createPinia());

app.use(PrimeVue, {
  theme: {
    preset: Aura,
  },
});
app.use(ConfirmationService);
app.use(ToastService);
app.use(router);

app.component("Avatar", Avatar);
app.component("Card", Card);
app.component("Button", Button);
app.component("InputNumber", InputNumber);
app.component("DataView", DataView);
app.component("ConfirmDialog", ConfirmDialog);
app.component("Toast", Toast);
app.component("Menubar", Menubar);
app.component("Skeleton", Skeleton);
app.component("Message", Message);
app.component("Divider", Divider);
app.component("Textarea", Textarea);
app.component("InputText", InputText);
app.component("Password", Password);
app.component("Dialog", Dialog);
app.component("DataTable", DataTable);
app.component("Column", Column);
app.component("Tag", Tag);
app.component("RadioButton", RadioButton);
app.component("Checkbox", Checkbox);
app.component("Breadcrumb", Breadcrumb);
app.component("AppBreadcrumb", AppBreadcrumb);

app.mount("#app");
