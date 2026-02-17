import { create } from "zustand"

export type NotificationType = "success" | "error" | "info" | "warning"

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

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  add: (message: string, type: NotificationType) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          message,
          type,
        },
      ],
    })),
  remove: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}))
