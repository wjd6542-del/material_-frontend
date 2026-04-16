import { defineStore } from "pinia"
import { ref, markRaw } from "vue"
import type { Component } from "vue"

export const useModalStore = defineStore("modal", () => {

	const isOpen = ref(false)
	const component = ref<Component | null>(null)
	const props = ref<Record<string, any>>({})
	const size = ref("md")   // 🔥 모달 사이즈 추가

	// 컴포넌트/props/사이즈를 받아 모달을 연다
	function openModal (comp: Component, compProps: Record<string, any> = {}, modalSize = "md") {
		component.value = markRaw(comp)
		props.value = compProps
		isOpen.value = true
		size.value = modalSize
	}

	// 모달을 닫고 관련 상태를 초기화한다
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