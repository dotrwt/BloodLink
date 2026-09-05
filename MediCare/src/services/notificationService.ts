import { mockDb } from "../mocks/mockDb";
import { handleResponse } from "./apiClient";
import type { AppNotification } from "../types/models";

export const notificationService = {
  async getNotifications(): Promise<AppNotification[]> {
    return handleResponse(mockDb.getNotifications());
  },

  async markAsRead(id: string): Promise<void> {
    return handleResponse(mockDb.markNotificationAsRead(id));
  },

  async markAllAsRead(): Promise<void> {
    return handleResponse(mockDb.markAllNotificationsAsRead());
  },
};
