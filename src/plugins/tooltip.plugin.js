// 커스텀 툴팁 플러그인 (v-tip 디렉티브)
//
// 사용:
//   <span v-tip="'자재 갯수 · 12개'">...</span>
//   <span :v-tip="dynamicText">...</span> (Vue 3: v-tip="text")
//
// 특징:
// - 단일 공용 툴팁 DOM을 document.body 에 mount → 부모 overflow 클립 영향 없음
// - position: fixed 로 getBoundingClientRect 기반 위치 계산
// - hover/focus 시 표시, 리스너 제거 누수 방지

let tipEl = null;
let arrowEl = null;

// 전역 툴팁 DOM 을 1회 생성한다
function ensureTooltip() {
	if (tipEl) return;

	tipEl = document.createElement("div");
	tipEl.className = "v-tip";
	Object.assign(tipEl.style, {
		position: "fixed",
		zIndex: "10000",
		padding: "4px 8px",
		fontSize: "10px",
		fontWeight: "600",
		color: "#fff",
		background: "#0f172a",
		borderRadius: "6px",
		boxShadow: "0 4px 12px rgba(15,23,42,0.25)",
		whiteSpace: "nowrap",
		pointerEvents: "none",
		opacity: "0",
		transition: "opacity 120ms ease",
		top: "-9999px",
		left: "-9999px",
	});

	arrowEl = document.createElement("span");
	Object.assign(arrowEl.style, {
		position: "absolute",
		left: "50%",
		bottom: "-4px",
		transform: "translateX(-50%)",
		width: "0",
		height: "0",
		borderLeft: "4px solid transparent",
		borderRight: "4px solid transparent",
		borderTop: "4px solid #0f172a",
	});
	tipEl.appendChild(arrowEl);
	document.body.appendChild(tipEl);
}

// 대상 엘리먼트 위에 툴팁을 위치시키고 보여준다
function showTooltip(target, text) {
	ensureTooltip();
	tipEl.firstChild && (tipEl.textContent = "");
	tipEl.appendChild(document.createTextNode(text));
	tipEl.appendChild(arrowEl);

	const rect = target.getBoundingClientRect();
	// 먼저 보이지 않게 치수 측정
	tipEl.style.opacity = "0";
	tipEl.style.left = "0px";
	tipEl.style.top = "0px";
	const tipRect = tipEl.getBoundingClientRect();

	let left = rect.left + rect.width / 2 - tipRect.width / 2;
	let top = rect.top - tipRect.height - 8;

	// 뷰포트 벗어나지 않도록 보정
	const pad = 6;
	if (left < pad) left = pad;
	if (left + tipRect.width > window.innerWidth - pad) {
		left = window.innerWidth - tipRect.width - pad;
	}
	// 상단이 뷰포트를 벗어나면 아래로 표시
	if (top < pad) {
		top = rect.bottom + 8;
		arrowEl.style.bottom = "auto";
		arrowEl.style.top = "-4px";
		arrowEl.style.borderTop = "none";
		arrowEl.style.borderBottom = "4px solid #0f172a";
	} else {
		arrowEl.style.top = "auto";
		arrowEl.style.bottom = "-4px";
		arrowEl.style.borderBottom = "none";
		arrowEl.style.borderTop = "4px solid #0f172a";
	}

	tipEl.style.left = `${Math.round(left)}px`;
	tipEl.style.top = `${Math.round(top)}px`;
	tipEl.style.opacity = "1";
}

// 툴팁 숨김
function hideTooltip() {
	if (!tipEl) return;
	tipEl.style.opacity = "0";
	tipEl.style.left = "-9999px";
	tipEl.style.top = "-9999px";
}

// 디렉티브 핸들러 바인딩/해제를 위한 WeakMap
const handlers = new WeakMap();

function bind(el, value) {
	const text = value == null ? "" : String(value);
	if (!text) {
		unbind(el);
		return;
	}

	// 이미 바인딩된 경우 텍스트만 갱신
	const existing = handlers.get(el);
	if (existing) {
		existing.text = text;
		return;
	}

	const state = { text };
	const onEnter = () => showTooltip(el, state.text);
	const onLeave = () => hideTooltip();
	el.addEventListener("mouseenter", onEnter);
	el.addEventListener("mouseleave", onLeave);
	el.addEventListener("focus", onEnter);
	el.addEventListener("blur", onLeave);

	handlers.set(el, { state, onEnter, onLeave });
}

function unbind(el) {
	const h = handlers.get(el);
	if (!h) return;
	el.removeEventListener("mouseenter", h.onEnter);
	el.removeEventListener("mouseleave", h.onLeave);
	el.removeEventListener("focus", h.onEnter);
	el.removeEventListener("blur", h.onLeave);
	handlers.delete(el);
}

export default {
	install(app) {
		app.directive("tip", {
			mounted(el, binding) {
				bind(el, binding.value);
			},
			updated(el, binding) {
				if (binding.value === binding.oldValue) return;
				if (binding.value) bind(el, binding.value);
				else unbind(el);
			},
			beforeUnmount(el) {
				unbind(el);
				hideTooltip();
			},
		});
	},
};
