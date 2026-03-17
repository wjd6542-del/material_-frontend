import { alertStore } from "./alert.store";

export default {
  install(app) {
    app.config.globalProperties.$alert = alertStore.openAlert.bind(alertStore);
    app.config.globalProperties.$confirm =
      alertStore.openConfirm.bind(alertStore);
  },
};
