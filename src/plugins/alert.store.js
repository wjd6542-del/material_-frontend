import { reactive } from "vue";

export const alertStore = reactive({
  visible: false,
  title: "",
  message: "",
  type: "alert",
  resolve: null,

  // 단일 확인(alert) 모달을 연다
  openAlert(message, title = "알림") {
    alertStore.visible = true;
    alertStore.title = title;
    alertStore.message = message;
    alertStore.type = "alert";
    alertStore.resolve = null;
  },

  // 확인/취소 Promise를 반환하는 confirm 모달을 연다
  openConfirm(message, title = "확인") {
    return new Promise((resolve) => {
      alertStore.visible = true;
      alertStore.title = title;
      alertStore.message = message;
      alertStore.type = "confirm";
      alertStore.resolve = resolve;
    });
  },

  // 확인 버튼 핸들러: confirm 모달이면 true로 resolve한다
  ok() {
    if (alertStore.type === "confirm" && alertStore.resolve) {
      alertStore.resolve(true);
    }
    alertStore.visible = false;
    alertStore.resolve = null;
  },

  // 취소 버튼 핸들러: confirm 모달이면 false로 resolve한다
  cancel() {
    if (alertStore.type === "confirm" && alertStore.resolve) {
      alertStore.resolve(false);
    }
    alertStore.visible = false;
    alertStore.resolve = null;
  },
});
