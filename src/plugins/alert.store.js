import { reactive } from "vue";

export const alertStore = reactive({
  visible: false,
  title: "",
  message: "",
  type: "alert",
  resolve: null,

  openAlert(message, title = "알림") {
    alertStore.visible = true;
    alertStore.title = title;
    alertStore.message = message;
    alertStore.type = "alert";
    alertStore.resolve = null;
  },

  openConfirm(message, title = "확인") {
    return new Promise((resolve) => {
      alertStore.visible = true;
      alertStore.title = title;
      alertStore.message = message;
      alertStore.type = "confirm";
      alertStore.resolve = resolve;
    });
  },

  ok() {
    if (alertStore.type === "confirm" && alertStore.resolve) {
      alertStore.resolve(true);
    }
    alertStore.visible = false;
    alertStore.resolve = null;
  },

  cancel() {
    if (alertStore.type === "confirm" && alertStore.resolve) {
      alertStore.resolve(false);
    }
    alertStore.visible = false;
    alertStore.resolve = null;
  },
});
