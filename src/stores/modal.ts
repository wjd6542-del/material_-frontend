import { defineStore } from "pinia"
import { ref, markRaw } from "vue"
import type { Component } from "vue"

export const useModalStore = defineStore("modal", () => {

	const isOpen = ref(false)
	const component = ref<Component | null>(null)
	const props = ref<Record<string, any>>({})
	const size = ref("md")   // 🔥 모달 사이즈 추가

	function openModal (comp: Component, compProps: Record<string, any> = {}, modalSize = "md") {
		component.value = markRaw(comp)
		props.value = compProps
		isOpen.value = true
		size.value = modalSize
	}

	function closeModal () {
		isOpen.value = false
		component.value = null
		props.value = {}
	}

	return {
		isOpen,
		component,
		props,
		size,
		openModal,
		closeModal
	}

})