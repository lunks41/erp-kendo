import { create } from "zustand"

export type NotificationType = "success" | "error" | "info" | "warning"

/** Auto-dismiss duration in ms. Toasts hide after this time. */
const AUTO_DISMISS_MS = 5_000

export interface NotificationItem {
  id: string
  message: string
  type: NotificationType
}

interface NotificationState {
  notifications: NotificationItem[]
  add: (message: string, type: NotificationType) => void
  remove: (id: string) => void
}

const timeoutIds = new Map<string, ReturnType<typeof setTimeout>>()

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  add: (message: string, type: NotificationType) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id, message, type },
      ],
    }))

    const timeoutId = setTimeout(() => {
      get().remove(id)
      timeoutIds.delete(id)
    }, AUTO_DISMISS_MS)
    timeoutIds.set(id, timeoutId)
  },
  remove: (id: string) => {
    const timeoutId = timeoutIds.get(id)
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutIds.delete(id)
    }
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },
}))
