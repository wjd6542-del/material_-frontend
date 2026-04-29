// @ts-nocheck
import { defineStore } from "pinia"
import { io, Socket } from "socket.io-client"
import api from "@/api/api"
import { useAuthStore } from "@/stores/auth"

export type ChatRoomType = "PUBLIC" | "DM"

export interface ChatUserRef {
	id: number
	name: string
	username: string
	code?: string
}

export interface ChatMessage {
	id: number
	room_id: number
	sender_id: number
	content: string
	created_at: string
	sender: ChatUserRef
	is_deleted?: boolean
	deleted_at?: string | null
	deleted_by?: number | null
	// 낙관적 UI용 임시 id (서버 수신 전)
	_pending?: boolean
}

export interface ChatRoomLastMessage {
	id: number
	content: string
	sender_id: number
	sender_name: string
	created_at: string
	is_deleted?: boolean
}

export interface ChatRoomListItem {
	id: number
	type: ChatRoomType
	name: string | null
	dm_key: string | null
	peer: ChatUserRef | null
	last_message: ChatRoomLastMessage | null
	last_read_at: string | null
	unread: number
	updated_at: string
}

interface State {
	socket: Socket | null
	connected: boolean
	rooms: ChatRoomListItem[]
	activeRoomId: number | null
	// 방별 메시지 맵
	messagesByRoom: Record<number, ChatMessage[]>
	// 방별 상대 last_read_at (읽음 표시)
	peerReadAtByRoom: Record<number, string>
	totalUnread: number
	panelOpen: boolean
	loadingRooms: boolean
	loadingMessages: boolean
	hasMoreBefore: Record<number, boolean>
}

const SOCKET_URL =
	(import.meta as any).env.VITE_SOCKET_URL ||
	(import.meta as any).env.VITE_API_URL ||
	"http://localhost:3001"

export const useChatStore = defineStore("chat", {
	state: (): State => ({
		socket: null,
		connected: false,
		rooms: [],
		activeRoomId: null,
		messagesByRoom: {},
		peerReadAtByRoom: {},
		totalUnread: 0,
		panelOpen: false,
		loadingRooms: false,
		loadingMessages: false,
		hasMoreBefore: {},
	}),

	getters: {
		activeRoom(state): ChatRoomListItem | null {
			if (state.activeRoomId == null) return null
			return state.rooms.find((r) => r.id === state.activeRoomId) ?? null
		},
		activeMessages(state): ChatMessage[] {
			if (state.activeRoomId == null) return []
			return state.messagesByRoom[state.activeRoomId] ?? []
		},
	},

	actions: {
		/** 소켓 연결 (로그인 직후 호출) */
		connect() {
			if (this.socket && this.connected) return
			const auth = useAuthStore()
			const token = auth.token || localStorage.getItem("token")
			if (!token) return

			this.socket = io(SOCKET_URL, {
				auth: { token },
				transports: ["websocket", "polling"],
			})

			this.socket.on("connect", () => {
				this.connected = true
			})
			this.socket.on("disconnect", () => {
				this.connected = false
			})
			this.socket.on("connect_error", (err: any) => {
				console.warn("[chat] connect_error", err?.message)
			})

			// 새 메시지 수신
			this.socket.on("message:new", (payload: { message: ChatMessage }) => {
				this.handleIncomingMessage(payload.message)
			})

			// 상대방 읽음 이벤트
			this.socket.on(
				"message:read",
				(payload: { user_id: number; room_id: number; last_read_at: string }) => {
					this.peerReadAtByRoom[payload.room_id] = payload.last_read_at
				},
			)

			// 메시지 삭제 브로드캐스트
			this.socket.on(
				"message:deleted",
				(payload: {
					message_id: number
					room_id: number
					deleted_at: string
					deleted_by: number
				}) => {
					this.applyMessageDeleted(payload)
				},
			)
		},

		/** 소켓 해제 (로그아웃 시) */
		disconnect() {
			if (this.socket) {
				this.socket.removeAllListeners()
				this.socket.disconnect()
				this.socket = null
			}
			this.connected = false
			this.rooms = []
			this.messagesByRoom = {}
			this.peerReadAtByRoom = {}
			this.activeRoomId = null
			this.totalUnread = 0
			this.panelOpen = false
		},

		/** 전체 공지방 보장 */
		async ensurePublicRoom(name = "전체 공지방") {
			try {
				await api.post("/api/chat/public/ensure", { name })
			} catch (e) {
				console.warn("ensurePublicRoom 실패", e)
			}
		},

		/** 방 목록 로드 */
		async loadRooms() {
			this.loadingRooms = true
			try {
				const res = await api.post("/api/chat/rooms", {})
				this.rooms = Array.isArray(res.data) ? res.data : []
				this.recalcTotalUnread()
			} finally {
				this.loadingRooms = false
			}
		},

		/** 전체 미읽음 건수 로드 */
		async loadUnreadCount() {
			try {
				const res = await api.post("/api/chat/unreadCount", {})
				this.totalUnread = Number(res.data) || 0
			} catch {
				// noop
			}
		},

		/** 방 선택 (join + 메시지 로드 + 읽음 처리) */
		async openRoom(roomId: number) {
			// 이전 방 leave
			if (this.activeRoomId && this.activeRoomId !== roomId && this.socket) {
				this.socket.emit("room:leave", { room_id: this.activeRoomId })
			}
			this.activeRoomId = roomId

			// 서버 채팅 룸 구독
			if (this.socket && this.connected) {
				this.socket.emit("room:join", { room_id: roomId })
			}

			// 최초 진입 시 메시지 로드
			if (!this.messagesByRoom[roomId]) {
				await this.loadMessages(roomId)
			}

			// 읽음 처리
			await this.markRead(roomId)
		},

		/** 방 떠나기 (패널 닫기 / 다른 방 선택 시) */
		leaveRoom() {
			if (this.activeRoomId && this.socket) {
				this.socket.emit("room:leave", { room_id: this.activeRoomId })
			}
			this.activeRoomId = null
		},

		/** 메시지 이력 로드 (beforeId 없으면 최신) */
		async loadMessages(roomId: number, beforeId?: number, limit = 50) {
			this.loadingMessages = true
			try {
				const body: any = { room_id: roomId, limit }
				if (beforeId) body.beforeId = beforeId
				const res = await api.post("/api/chat/messages", body)
				const list: ChatMessage[] = Array.isArray(res.data) ? res.data : []
				const existing = this.messagesByRoom[roomId] ?? []
				if (beforeId) {
					// 위쪽에 과거 메시지 prepend
					this.messagesByRoom[roomId] = [...list, ...existing]
				} else {
					this.messagesByRoom[roomId] = list
				}
				this.hasMoreBefore[roomId] = list.length >= limit
			} finally {
				this.loadingMessages = false
			}
		},

		/** 메시지 전송 (낙관적 UI) */
		async sendMessage(roomId: number, content: string) {
			if (!content?.trim()) return
			if (!this.socket) return

			return new Promise<void>((resolve) => {
				this.socket!.emit(
					"message:send",
					{ room_id: roomId, content: content.trim() },
					(ack: any) => {
						if (ack?.success && ack.message) {
							// push (서버가 브로드캐스트도 하니 중복 방지를 위해 id 체크)
							this.handleIncomingMessage(ack.message)
						} else {
							console.warn("message:send 실패", ack?.error)
						}
						resolve()
					},
				)
			})
		},

		/** 수신 메시지 통합 처리 (새 메시지 브로드캐스트 or 전송 ack) */
		handleIncomingMessage(msg: ChatMessage) {
			if (!msg) return
			const list = this.messagesByRoom[msg.room_id] ?? []
			// 중복 방지
			if (list.some((m) => m.id === msg.id)) return
			this.messagesByRoom[msg.room_id] = [...list, msg]

			// 방 목록의 last_message 업데이트 및 정렬
			const room = this.rooms.find((r) => r.id === msg.room_id)
			if (room) {
				room.last_message = {
					id: msg.id,
					content: msg.content,
					sender_id: msg.sender_id,
					sender_name: msg.sender.name,
					created_at: msg.created_at,
				}
				room.updated_at = msg.created_at

				// 현재 활성 방 + 내가 보낸 메시지가 아니면 unread 증가
				const auth = useAuthStore()
				const myId = auth.user?.id
				const isMine = msg.sender_id === myId
				if (!isMine && this.activeRoomId !== msg.room_id) {
					room.unread = (room.unread || 0) + 1
					this.totalUnread += 1
				}
				// 방 목록 최신순 재정렬
				this.rooms.sort((a, b) => {
					const ta = new Date(a.updated_at).getTime()
					const tb = new Date(b.updated_at).getTime()
					return tb - ta
				})
			}

			// 현재 활성 방의 메시지면 즉시 읽음 처리
			if (this.activeRoomId === msg.room_id) {
				this.markRead(msg.room_id)
			}
		},

		/** 읽음 처리 (REST + socket 이벤트) */
		async markRead(roomId: number) {
			if (!roomId) return
			try {
				await api.post("/api/chat/read", { room_id: roomId })
				// 방 목록의 unread 리셋 + 전체 unread 차감
				const room = this.rooms.find((r) => r.id === roomId)
				if (room) {
					this.totalUnread = Math.max(0, this.totalUnread - (room.unread || 0))
					room.unread = 0
					room.last_read_at = new Date().toISOString()
				}
				// 소켓으로 상대에게 알림
				if (this.socket) {
					this.socket.emit("message:read", { room_id: roomId })
				}
			} catch (e) {
				console.warn("markRead 실패", e)
			}
		},

		/** DM 유저 검색 */
		async searchDmUsers(keyword = ""): Promise<ChatUserRef[]> {
			try {
				const res = await api.post("/api/chat/users", { keyword })
				return Array.isArray(res.data) ? res.data : []
			} catch {
				return []
			}
		},

		/** DM 방 생성/조회 */
		async openDm(targetUserId: number): Promise<ChatRoomListItem | null> {
			try {
				const res = await api.post("/api/chat/dm", {
					target_user_id: targetUserId,
				})
				const room = res.data
				if (!room) return null

				// 방 목록 갱신 (없으면 추가)
				const existing = this.rooms.find((r) => r.id === room.id)
				if (!existing) {
					// 최소 필드로 임시 주입 후 목록 재로드
					await this.loadRooms()
				}
				await this.openRoom(room.id)
				return this.rooms.find((r) => r.id === room.id) ?? null
			} catch (e) {
				console.warn("openDm 실패", e)
				return null
			}
		},

		/** 메시지 삭제 (소프트) - REST + 서버가 socket 브로드캐스트 */
		async deleteMessage(messageId: number): Promise<boolean> {
			if (!messageId) return false
			// 소켓 사용 가능하면 socket ack 경로 선호 (실시간)
			if (this.socket && this.connected) {
				return new Promise<boolean>((resolve) => {
					this.socket!.emit(
						"message:delete",
						{ message_id: messageId },
						(ack: any) => {
							if (ack?.success) {
								resolve(true)
							} else {
								console.warn("message:delete 실패", ack?.error)
								resolve(false)
							}
						},
					)
				})
			}
			// 소켓이 없으면 REST 폴백
			try {
				const res = await api.post("/api/chat/message/delete", {
					message_id: messageId,
				})
				const msg = res.data
				if (msg?.id) {
					this.applyMessageDeleted({
						message_id: msg.id,
						room_id: msg.room_id,
						deleted_at: msg.deleted_at,
						deleted_by: msg.deleted_by,
					})
				}
				return true
			} catch (e) {
				console.warn("message:delete REST 실패", e)
				return false
			}
		},

		/** 삭제 이벤트/응답을 상태에 반영한다 */
		applyMessageDeleted(payload: {
			message_id: number
			room_id: number
			deleted_at: string
			deleted_by: number
		}) {
			const list = this.messagesByRoom[payload.room_id]
			if (list) {
				const target = list.find((m) => m.id === payload.message_id)
				if (target) {
					target.content = ""
					target.is_deleted = true
					target.deleted_at = payload.deleted_at
					target.deleted_by = payload.deleted_by
				}
			}
			// 방 목록의 last_message도 반영
			const room = this.rooms.find((r) => r.id === payload.room_id)
			if (room && room.last_message && room.last_message.id === payload.message_id) {
				room.last_message.content = ""
				room.last_message.is_deleted = true
			}
		},

		/** 방 나가기 (DM 제외) */
		async leaveRoomPersistent(roomId: number) {
			try {
				await api.post("/api/chat/leave", { room_id: roomId })
				this.rooms = this.rooms.filter((r) => r.id !== roomId)
				if (this.activeRoomId === roomId) {
					this.activeRoomId = null
				}
				this.recalcTotalUnread()
			} catch (e) {
				console.warn("leaveRoom 실패", e)
			}
		},

		/** 방 목록에서 unread 합계 재계산 */
		recalcTotalUnread() {
			this.totalUnread = this.rooms.reduce(
				(sum, r) => sum + (r.unread || 0),
				0,
			)
		},

		/** 패널 열기/닫기 */
		openPanel() {
			this.panelOpen = true
		},
		closePanel() {
			this.panelOpen = false
			this.leaveRoom()
		},
	},
})