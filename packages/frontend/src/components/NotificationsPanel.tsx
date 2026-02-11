import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Bell, Check } from "lucide-react";

interface Notification {
    id: string;
    type: "donation" | "request" | "match" | "system";
    title: string;
    message: string;
    time: string;
    read: boolean;
    link?: string;
}

const mockNotifications: Notification[] = [
    {
        id: "1",
        type: "match",
        title: "New Match Found!",
        message: "Your donation has been matched with Feed The Hungry Foundation",
        time: "5 min ago",
        read: false,
        link: "/donations/1",
    },
    {
        id: "2",
        type: "request",
        title: "New Food Request",
        message: "Hope Shelter needs 100 servings of food urgently",
        time: "1 hour ago",
        read: false,
        link: "/requests/r2",
    },
    {
        id: "3",
        type: "donation",
        title: "Donation Verified",
        message: "Your donation has been verified and is now active",
        time: "3 hours ago",
        read: true,
        link: "/dashboard",
    },
];

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationsPanel = ({ isOpen, onClose }: NotificationsPanelProps) => {
    const [notifications, setNotifications] = useState(mockNotifications);

    const markAsRead = (id: string) => {
        setNotifications(
            notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map((n) => ({ ...n, read: true })));
    };

    if (!isOpen) return null;

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 z-40"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed top-16 right-4 w-96 max-h-[600px] glass rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        <h3 className="font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                                {unreadCount}
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="text-xs"
                            >
                                <Check className="w-3 h-3 mr-1" />
                                Mark all read
                            </Button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-accent transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[500px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    to={notification.link || "#"}
                                    onClick={() => {
                                        markAsRead(notification.id);
                                        onClose();
                                    }}
                                    className={`block p-4 hover:bg-accent/50 transition-colors ${!notification.read ? "bg-primary/5" : ""
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notification.read ? "bg-primary" : "bg-transparent"
                                                }`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-sm mb-1">
                                                {notification.title}
                                            </h4>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {notification.time}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationsPanel;
