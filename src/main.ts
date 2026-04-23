import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import pinia from './stores/pinia'
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"



// 토스 알림용
import Toast, { useToast } from "vue-toastification";
import "vue-toastification/dist/index.css";

// 폰트 어섬 적용
import '@fortawesome/fontawesome-free/css/all.min.css'

// 테일윈드 적용
import './assets/tailwind.css'

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// 알림창
import AlertPlugin from "@/plugins/alert.plugin";
// 커스텀 툴팁 (v-tip 디렉티브)
import TooltipPlugin from "@/plugins/tooltip.plugin";
// 캘린더
import VCalendar from "v-calendar";
import "v-calendar/style.css";

import VueECharts from "vue-echarts"
import * as echarts from "echarts/core"
import {
	BarChart,
	LineChart,
	PieChart
} from "echarts/charts"

import {
	TitleComponent,
	TooltipComponent,
	GridComponent,
	LegendComponent
} from "echarts/components"

import { CanvasRenderer } from "echarts/renderers"

echarts.use([
	BarChart,
	LineChart,
	PieChart,
	TitleComponent,
	TooltipComponent,
	GridComponent,
	LegendComponent,
	CanvasRenderer
])


/* ✅ AG Grid v33 */
import { ModuleRegistry, AllCommunityModule, RowSelectionModule } from "ag-grid-community";

/* ✅ 커뮤니티 전체 기능 등록 */
ModuleRegistry.registerModules([AllCommunityModule, RowSelectionModule]);

const app = createApp(App)

// 피나야 적용
app.use(pinia)
pinia.use(piniaPluginPersistedstate)

// 데이터 레인지 
app.use(VCalendar, {});
// 전역 토스 적용
app.use(Toast, {
	position: "top-right",
	timeout: 2000,
	closeOnClick: true,
	pauseOnHover: true,
});
app.component("v-chart", VueECharts)
app.config.globalProperties.$toast = useToast();
app.use(AlertPlugin)
app.use(TooltipPlugin)
app.use(router)
app.mount('#app')

