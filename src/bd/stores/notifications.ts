import Store from "./base";
import type {Notification} from "../ui/notifications";

export default new class Notifications extends Store {
    private notificationsArray: Notification[] = [];

    setNotifications(notifications: Notification[]) {
        this.notificationsArray = notifications;
        this.emitChange();
    }

    removeNotification(id: string) {
        this.notificationsArray = this.notificationsArray.filter((n: Notification) => n.id !== id);
        this.emitChange();
    }

    addNotification(notification: Notification) {
        this.notificationsArray.push(notification);
        this.emitChange();
    }

    get notifications(): Notification[] {
        return this.notificationsArray;
    }
};