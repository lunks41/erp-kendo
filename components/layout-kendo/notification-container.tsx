"use client"

import { Notification, NotificationGroup } from "@progress/kendo-react-notification"
import { useNotificationStore } from "@/stores/notification-store"

/**
 * Toast API - call from anywhere (hooks, components, etc.)
 * Requires NotificationContainer to be mounted in your app layout.
 */
export const toast = {
  success: (message: string) => {
    useNotificationStore.getState().add(message, "success")
  },
  error: (message: string) => {
    useNotificationStore.getState().add(message, "error")
  },
  info: (message: string) => {
    useNotificationStore.getState().add(message, "info")
  },
  warning: (message: string) => {
    useNotificationStore.getState().add(message, "warning")
  },
}

const typeMap = {
  success: { style: "success" as const, icon: true },
  error: { style: "error" as const, icon: true },
  info: { style: "info" as const, icon: true },
  warning: { style: "warning" as const, icon: true },
}

export function NotificationContainer() {
  const { notifications, remove } = useNotificationStore()

  return (
    <NotificationGroup
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        padding: "1rem",
      }}
    >
      {notifications.map((item) => (
        <Notification
          key={item.id}
          type={typeMap[item.type]}
          closable
          onClose={() => remove(item.id)}
        >
          {item.message}
        </Notification>
      ))}
    </NotificationGroup>
  )
}
