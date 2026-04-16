<template>
  <div name="list" class="space-y-3">
    <!-- 🔍 검색 -->
    <div class="relative">
      <input
        v-model="keyword"
        type="text"
        placeholder="이름 또는 주소 검색"
        class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <i
        class="fa-solid fa-magnifying-glass absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
      ></i>
    </div>

    <!-- ❌ 검색 결과 없음 -->
    <div
      v-if="filteredList.length === 0"
      class="p-5 rounded-xl border bg-white shadow-sm text-center"
    >
      검색 결과가 없습니다.
    </div>

    <!-- 📌 리스트 -->
    <transition-group name="list" tag="div" class="space-y-3">
      <div
        v-for="item in filteredList"
        :key="item.id"
        class="p-3 border rounded-lg hover:bg-gray-50 flex justify-between items-center"
      >
        <div @click="move(item)" class="cursor-pointer">
          <div class="font-medium">{{ item.name }}</div>
          <div class="text-xs text-gray-500">
            <p>주소 : {{ item.address }}</p>
            <p v-if="item.address_detail">상세 : {{ item.address_detail }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            title="주소 복사"
            class="text-gray-500 hover:text-blue-600"
            @click.stop="copyAddress(item)"
          >
            <i class="fa-regular fa-copy"></i>
          </button>

          <button
            title="북마크 삭제"
            class="text-red-500 hover:text-red-700"
            @click.stop="remove(item)"
          >
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { useBookmarkStore } from "@/stores/bookmarkStore";
import { computed, ref } from "vue";

export default {
  name: "BookmarkList",
  emits: ["close"],

  // 북마크 스토어와 키워드 필터링 컴퓨티드를 초기화한다
  setup() {
    const bookmarkStore = useBookmarkStore();
    const keyword = ref("");

    // 키워드로 이름/주소를 필터링한 북마크 목록을 반환한다
    const filteredList = computed(() => {
      if (!keyword.value.trim()) {
        return bookmarkStore.list;
      }

      const search = keyword.value.toLowerCase();

      return bookmarkStore.list.filter((item) => {
        return (
          item.name?.toLowerCase().includes(search) ||
          item.address?.toLowerCase().includes(search)
        );
      });
    });

    return {
      bookmarkStore,
      keyword,
      filteredList,
    };
  },

  methods: {
    // 선택한 북마크의 주소를 클립보드에 복사한다
    async copyAddress(item) {
      try {
        await navigator.clipboard.writeText(item.address);
        this.$toast?.success("주소가 클립보드에 복사되었습니다");
      } catch (err) {
        this.$toast?.error("복사에 실패했습니다");
      }
    },

    // 북마크를 스토어에서 제거한다
    remove(data) {
      this.bookmarkStore.remove(data.key);
      this.$toast?.success(`${data.name} 북마크가 삭제 처리 되었습니다`);
    },

    // 북마크 항목 클릭 시 상세 페이지로 이동하고 모달을 닫는다
    move(data) {
      this.$router.push({
        path: `/locationDetail`,
        query: {
          gym_id: data.id,
          route_id: data.route_id || null,
        },
      });
      this.$emit("close");
    },
  },
};
</script>
