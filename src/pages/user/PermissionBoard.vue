<template>
  <div>
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold flex items-center gap-2">
        <i class="fa-solid fa-user-shield text-blue-500"></i>
        {{ user.name }} 권한 설정
      </h2>

      <button
        @click="save"
        class="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow"
      >
        <i class="fa-solid fa-floppy-disk"></i>
        저장
      </button>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <!-- 미보유 -->
      <div class="bg-white rounded-2xl shadow border p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-gray-600 flex items-center gap-2">
            <i class="fa-solid fa-circle-xmark text-gray-400"></i>
            미보유 권한
          </h3>
          <span class="text-xs bg-gray-100 px-2 py-1 rounded">
            {{ unassigned.length }}
          </span>
        </div>

        <div class="space-y-2 max-h-[400px] overflow-y-auto">
          <div
            v-for="item in unassigned"
            :key="item.id"
            class="group p-3 bg-gray-50 border rounded-xl flex justify-between items-center hover:shadow hover:bg-white transition"
          >
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-lock text-gray-400 text-sm"></i>
              <span class="text-sm">{{ item.name }}</span>
            </div>

            <button
              @click="addPermission(item)"
              class="opacity-0 group-hover:opacity-100 transition text-blue-500 hover:text-blue-700"
            >
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 중앙 컨트롤 -->
      <div class="flex flex-col justify-center items-center gap-4">
        <button
          @click="addAll"
          class="w-12 h-12 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
        >
          <i class="fa-solid fa-angles-right"></i>
        </button>

        <button
          @click="removeAll"
          class="w-12 h-12 flex items-center justify-center rounded-full bg-gray-400 hover:bg-gray-500 text-white shadow-lg"
        >
          <i class="fa-solid fa-angles-left"></i>
        </button>
      </div>

      <!-- 보유 -->
      <div class="bg-white rounded-2xl shadow border p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-green-600 flex items-center gap-2">
            <i class="fa-solid fa-circle-check"></i>
            보유 권한
          </h3>
          <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            {{ assigned.length }}
          </span>
        </div>

        <div class="space-y-2 max-h-[400px] overflow-y-auto">
          <div
            v-for="(item, index) in assigned"
            :key="item.id"
            class="group p-3 bg-green-50 border rounded-xl flex justify-between items-center hover:shadow hover:bg-white transition"
          >
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-unlock text-green-500 text-sm"></i>
              <span class="text-sm font-medium">{{ item.name }}</span>
            </div>

            <div
              class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition"
            >
              <!-- 위 -->
              <button
                @click="moveUp(index)"
                class="text-gray-400 hover:text-black"
              >
                <i class="fa-solid fa-arrow-up"></i>
              </button>

              <!-- 아래 -->
              <button
                @click="moveDown(index)"
                class="text-gray-400 hover:text-black"
              >
                <i class="fa-solid fa-arrow-down"></i>
              </button>

              <!-- 제거 -->
              <button
                @click="removePermission(item)"
                class="text-red-400 hover:text-red-600"
              >
                <i class="fa-solid fa-arrow-left"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: { user: Object },

  data() {
    return {
      assigned: [],
      unassigned: [],
    };
  },

  mounted() {
    this.loadPermissions();
  },

  methods: {
    loadPermissions() {
      const all = [
        { id: 1, name: "자재조회" },
        { id: 2, name: "자재등록" },
        { id: 3, name: "입고관리" },
        { id: 4, name: "출고관리" },
      ];

      const assignedIds = this.user.id === 1 ? [1, 2, 3] : [1, 3];

      this.assigned = all.filter((p) => assignedIds.includes(p.id));
      this.unassigned = all.filter((p) => !assignedIds.includes(p.id));
    },

    addPermission(item) {
      this.assigned.push(item);
      this.unassigned = this.unassigned.filter((p) => p.id !== item.id);
    },

    removePermission(item) {
      this.unassigned.push(item);
      this.assigned = this.assigned.filter((p) => p.id !== item.id);
    },

    addAll() {
      this.assigned.push(...this.unassigned);
      this.unassigned = [];
    },

    removeAll() {
      this.unassigned.push(...this.assigned);
      this.assigned = [];
    },

    moveUp(index) {
      if (index === 0) return;
      [this.assigned[index - 1], this.assigned[index]] = [
        this.assigned[index],
        this.assigned[index - 1],
      ];
    },

    moveDown(index) {
      if (index === this.assigned.length - 1) return;
      [this.assigned[index + 1], this.assigned[index]] = [
        this.assigned[index],
        this.assigned[index + 1],
      ];
    },

    save() {
      const payload = this.assigned.map((p, i) => ({
        permission_id: p.id,
        sort: i,
      }));

      console.log(payload);
    },
  },
};
</script>
