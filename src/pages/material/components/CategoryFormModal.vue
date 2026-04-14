<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="open" class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-container">
          <div class="modal-header">
            <div class="modal-header-icon" :class="editMode ? 'edit' : 'add'">
              <i
                class="fa-solid"
                :class="editMode ? 'fa-pen-to-square' : 'fa-folder-plus'"
              ></i>
            </div>
            <div>
              <h3 class="modal-title">{{ title }}</h3>
              <p v-if="parentName" class="modal-subtitle">
                <i
                  class="fa-solid fa-turn-up fa-rotate-90 mr-1 text-slate-300"
                ></i>
                {{ parentName }}
              </p>
            </div>
            <button @click="$emit('close')" class="modal-close">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="modal-form-group">
              <label>카테고리명 <span class="text-red-400">*</span></label>
              <input
                v-model="localName"
                placeholder="예: 금속류"
                ref="nameInput"
                @keyup.enter="submit"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button @click="$emit('close')" class="modal-btn cancel">취소</button>
            <button @click="submit" class="modal-btn confirm">
              <i class="fa-solid fa-check mr-1"></i>
              {{ editMode ? "수정" : "등록" }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: "CategoryFormModal",
  props: {
    open: { type: Boolean, default: false },
    editMode: { type: Boolean, default: false },
    hasParent: { type: Boolean, default: false },
    parentName: { type: String, default: "" },
    initialName: { type: String, default: "" },
  },
  emits: ["close", "submit"],
  data() {
    return { localName: "" };
  },
  computed: {
    title() {
      if (this.editMode) return "카테고리 수정";
      if (this.hasParent) return "하위 카테고리 등록";
      return "루트 카테고리 등록";
    },
  },
  watch: {
    open(val) {
      if (val) {
        this.localName = this.initialName;
        this.$nextTick(() => this.$refs.nameInput?.focus());
      }
    },
  },
  methods: {
    submit() {
      if (!this.open) return;
      const name = this.localName.trim();
      if (!name) {
        this.$toast.error("카테고리명을 입력하세요");
        return;
      }
      this.$emit("submit", name);
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}
.modal-container {
  background: white;
  border-radius: 16px;
  width: 440px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}
.modal-header-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.modal-header-icon.add {
  background: #ecfdf5;
  color: #10b981;
}
.modal-header-icon.edit {
  background: #eff6ff;
  color: #3b82f6;
}
.modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}
.modal-subtitle {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}
.modal-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.15s;
  margin-left: auto;
}
.modal-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}
.modal-body {
  padding: 24px;
}
.modal-form-group {
  margin-bottom: 16px;
}
.modal-form-group:last-child {
  margin-bottom: 0;
}
.modal-form-group label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.modal-form-group input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: all 0.15s;
  background: #fafbfc;
}
.modal-form-group input:focus {
  border-color: #93c5fd;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.08);
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
  background: #fafbfc;
}
.modal-btn {
  padding: 9px 20px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.15s;
}
.modal-btn.confirm {
  background: #3b82f6;
  color: white;
}
.modal-btn.confirm:hover {
  background: #2563eb;
}
.modal-btn.cancel {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.modal-btn.cancel:hover {
  background: #f1f5f9;
}
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.2s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .modal-container {
  transform: scale(0.95) translateY(10px);
}
.modal-fade-leave-to .modal-container {
  transform: scale(0.95) translateY(10px);
}
</style>
