// @ts-nocheck
import { watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useChatStore } from "@/stores/chat";

/**
 * 앱 부팅 시 한번 실행되는 초기화 로직.
 *  - auth 세션 복원
 *  - 로그인 상태에 따라 알림 자동 갱신/채팅 소켓을 동기화
 */
export function useAppInit() {
  const auth = useAuthStore();
  const noti = useNotificationStore();
  const chat = useChatStore();

  auth.restore();

  // 로그인 상태 변화에 따라 알림 갱신 / 채팅 소켓을 동기화
  const sync = async (isLogin: boolean) => {
    if (isLogin) {
      noti.startAutoRefresh();
      chat.connect();
      await chat.ensurePublicRoom();
      await chat.loadRooms();
      await chat.loadUnreadCount();
    } else {
      chat.disconnect();
    }
  };

  // 최초 복원 후 즉시 동기화
  sync(auth.isLogin);

  // 이후 로그인 상태 변화 감지
  watch(() => auth.isLogin, sync);
}