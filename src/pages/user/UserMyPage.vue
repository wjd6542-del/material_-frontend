<template>
  <div class="max-w-7xl mx-auto p-8 space-y-8 bg-gray-50/50 min-h-screen">
    <!-- 상단 타이틀 구역 -->
    <div class="flex justify-between items-end mb-4">
      <div>
        <h1 class="text-3xl font-black text-gray-900">마이페이지</h1>
        <p class="text-gray-500 mt-2">
          내 계정의 보안 상태와 권한 설정 현황을 확인합니다.
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- [LEFT] 1. 계정 정보 카드 -->
      <div class="lg:col-span-1 space-y-6">
        <section
          class="bg-white rounded-[2rem] border shadow-sm overflow-hidden"
        >
          <div class="h-32 bg-gradient-to-br from-blue-600 to-indigo-700"></div>
          <div class="px-6 pb-8 -mt-12 text-center">
            <div class="inline-flex p-1 bg-white rounded-3xl shadow-lg mb-4">
              <div
                class="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl border-4 border-white"
              >
                <i class="fa-solid fa-user-tie text-blue-600"></i>
              </div>
            </div>
            <h2 class="text-2xl font-black text-gray-800">{{ user.name }}</h2>
            <p class="text-sm text-gray-400 font-medium mb-6">
              {{ user.username }}
            </p>

            <div class="grid grid-cols-2 gap-2 text-left">
              <div class="p-3 bg-gray-50 rounded-2xl">
                <p class="text-[10px] text-gray-400 font-bold uppercase">
                  권한 유형
                </p>
                <p class="text-sm font-bold text-gray-700">
                  {{ user.is_super ? "슈퍼유저" : "일반" }}
                </p>
              </div>
              <div class="p-3 bg-gray-50 rounded-2xl">
                <p class="text-[10px] text-gray-400 font-bold uppercase">
                  상태
                </p>
                <p class="text-sm font-bold text-green-600">정상</p>
              </div>
            </div>
          </div>
        </section>

        <!-- 계정 상태 요약 -->
        <section class="bg-white rounded-[2rem] border p-6 shadow-sm">
          <h3
            class="text-sm font-black text-gray-800 mb-4 flex items-center gap-2"
          >
            <i class="fa-solid fa-circle-check text-green-500"></i> 계정 상태
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2">
              <span class="text-sm text-gray-500">계정 등급</span>
              <span
                class="px-2 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-lg uppercase"
              >
                {{ user.role?.name || "Standard User" }}
              </span>
            </div>
          </div>
        </section>
      </div>

      <!-- [RIGHT] 2 & 3. 보안 및 권한 상세 -->
      <div class="lg:col-span-2 space-y-8">
        <!-- 2. 아이피 정보 리스트 (조회용) -->
        <section
          class="bg-white rounded-[2rem] border shadow-sm overflow-hidden flex flex-col"
        >
          <div
            class="p-6 border-b flex items-center justify-between bg-gray-50/50"
          >
            <h3 class="font-black text-gray-800 flex items-center gap-2">
              <i class="fa-solid fa-shield-halved text-blue-500"></i> 접속 허용
              IP 정보
            </h3>
            <span
              v-if="ipList.length > 0"
              class="text-xs font-bold text-gray-400"
            >
              총 {{ ipList.length }}개 등록됨
            </span>
          </div>

          <div v-if="ipList.length > 0" class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50/30 border-b">
                <tr
                  class="text-left text-[11px] text-gray-400 uppercase tracking-widest font-bold"
                >
                  <th class="px-6 py-4">아이피 주소</th>
                  <th class="px-6 py-4">용도 / 메모</th>
                  <th class="px-6 py-4">상태</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr
                  v-for="ip in ipList"
                  :key="ip.id"
                  class="hover:bg-gray-50/50 transition-colors"
                >
                  <td class="px-6 py-4 font-mono text-sm text-gray-700">
                    {{ ip.ip }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-500">
                    {{ ip.memo || "-" }}
                  </td>
                  <td class="px-6 py-4">
                    <span
                      v-if="ip.is_active"
                      class="flex items-center gap-1.5 text-xs font-bold text-blue-600"
                    >
                      <span
                        class="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"
                      ></span>
                      ACTIVE
                    </span>
                    <span v-else class="text-xs font-bold text-gray-300"
                      >INACTIVE</span
                    >
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-else
            class="flex-1 flex flex-col items-center justify-center py-20 px-6"
          >
            <div
              class="w-16 h-16 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mb-4"
            >
              <i class="fa-solid fa-shield-slash text-2xl"></i>
            </div>
            <p class="text-gray-800 font-bold">등록된 IP 정보가 없습니다.</p>
            <p class="text-gray-400 text-xs mt-1 text-center">
              보안을 위해 접속 가능한 IP 화이트리스트를 관리자에게 요청하세요.
            </p>
          </div>
        </section>

        <!-- 3. 권한 설정 정보 (조회용 그리드) -->
        <section class="bg-white rounded-[2rem] border shadow-sm p-8">
          <h3 class="font-black text-gray-800 mb-6 flex items-center gap-2">
            <i class="fa-solid fa-key text-orange-500"></i> 내 시스템 권한 현황
          </h3>

          <!-- 그룹핑된 권한 출력 -->
          <div
            v-if="Object.keys(groupedPermissions).length > 0"
            class="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div
              v-for="(items, groupName) in groupedPermissions"
              :key="groupName"
              class="p-5 border rounded-2xl hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 transition-all group bg-white"
            >
              <div class="flex items-center justify-between mb-3">
                <span
                  class="text-xs font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-2 py-0.5 rounded"
                >
                  {{ groupName }}
                </span>
                <i
                  class="fa-solid fa-layer-group text-gray-200 group-hover:text-blue-200 transition-colors"
                ></i>
              </div>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="p in items"
                  :key="p.id"
                  class="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-bold rounded-md group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors border border-gray-100"
                >
                  {{ p.name }}
                </span>
              </div>
            </div>
          </div>

          <div
            v-else
            class="py-12 flex flex-col items-center border border-dashed rounded-3xl bg-gray-50/50"
          >
            <div
              class="w-12 h-12 bg-white shadow-sm rounded-xl flex items-center justify-center mb-3"
            >
              <i class="fa-solid fa-lock text-gray-300"></i>
            </div>
            <p class="text-sm font-bold text-gray-600">
              할당된 시스템 권한이 없습니다.
            </p>
          </div>

          <div
            class="mt-8 p-4 bg-orange-50 rounded-2xl flex items-center gap-4 border border-orange-100"
          >
            <div
              class="w-10 h-10 bg-white rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm"
            >
              <i class="fa-solid fa-circle-info text-orange-400"></i>
            </div>
            <p class="text-xs text-orange-700 leading-relaxed">
              본인에게 부여된 권한은 시스템 관리 정책에 의해 결정됩니다. <br />
              추가 권한이 필요하신 경우 <strong>[관리자]</strong>에게 문의하시기
              바랍니다.
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
import api from "@/api/api";

export default {
  name: "UserMyPage",

  setup() {
    const auth = useAuthStore();
    return { auth };
  },

  data() {
    return {
      user: this.auth.user,
      ipList: [],
    };
  },

  computed: {
    // 유저 정보 내 permissionList를 그룹별로 계산
    groupedPermissions() {
      const list = this.user?.permissionList || [];
      return list.reduce((acc, current) => {
        const group = current.group || "ETC";
        if (!acc[group]) acc[group] = [];
        acc[group].push(current);
        return acc;
      }, {});
    },
  },

  methods: {
    // 유저 허용 IP 리스트 조회
    async loadUserIpList() {
      try {
        const res = await api.post("/api/user/ip/list", {
          user_id: this.user.id,
        });
        this.ipList = res.data;
      } catch (err) {
        console.error("IP 리스트 로드 실패", err);
      }
    },
  },

  mounted() {
    this.loadUserIpList();
  },
};
</script>

<style scoped>
section {
  transition: transform 0.2s ease-out;
}
</style>
