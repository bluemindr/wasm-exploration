import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./components/App.vue";
import { parseResearchResultSelectionFromUrl, showResearchResult, useStore } from "./store";
import "./index.css";
import "tippy.js/dist/tippy.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

const researchSelection = parseResearchResultSelectionFromUrl();
if (researchSelection) {
	showResearchResult(useStore(pinia), researchSelection, false);
}

app.mount("#app");
