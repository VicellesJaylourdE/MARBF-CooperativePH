import React, { useEffect, useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonAvatar,
  IonLabel,
  IonSpinner,
  IonBadge,
  IonPopover,
  IonButtons,
  IonImg,
} from "@ionic/react";
import { 
    logOutOutline, 
    notificationsOutline, 
    businessOutline, 
    checkmarkCircleOutline, 
    refreshOutline, 
    timeOutline, 
} from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import moment from 'moment';

// 🔥 1. IMPORT PARA SA PUSH NOTIFICATIONS
import { PushNotifications } from "@capacitor/push-notifications";

interface UserBookingNotification {
    id: string;
    title: string;
    message: string;
    status: 'approved' | 'in_use' | 'returned'; 
    created_at: string;
    is_expired: boolean;
    display_icon: string;
    display_color: string;
    type: 'booking';
    is_read: boolean;
}

const Farmer_HeaderBar: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("User");
  const [initials, setInitials] = useState<string>("U");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [userBookingsNotifications, setUserBookingsNotifications] = useState<UserBookingNotification[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [loginMethod, setLoginMethod] = useState<string>("User");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const RETURNED_EXPIRY_MINUTES = 10;

  // 🔥 2. PUSH NOTIFICATION SETUP FUNCTION
  const setupPushNotifications = async (userId: number) => {
    try {
      let perm = await PushNotifications.checkPermissions();
      if (perm.receive !== 'granted') {
        perm = await PushNotifications.requestPermissions();
      }

      if (perm.receive === 'granted') {
        await PushNotifications.register();
      }

      PushNotifications.addListener('registration', async (token) => {
        console.log("Farmer Token:", token.value);
        // I-save ang token sa database para ma-notify ang farmer inig approve sa admin
        await supabase
          .from("users")
          .update({ fcm_token: token.value })
          .eq("user_id", userId);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log("Push Received:", notification);
        if (currentUserId) fetchUserBookingNotifications(currentUserId);
        fetchNotifications();
      });

    } catch (err) {
      console.error("Push Setup Error:", err);
    }
  };

  const fetchUserData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }
    
    const { data: profile } = await supabase
        .from("users")
        .select("user_id, username, user_avatar_url, user_phone")
        .eq(user.email ? "user_email" : "user_phone", user.email || user.phone)
        .single();

    if (profile) {
        const username = profile.username || "User";
        const init = username.split(" ").map((n: string) => n[0]?.toUpperCase()).join("");
        setUserName(username);
        setInitials(init);
        setAvatarUrl(profile.user_avatar_url || null);
        setCurrentUserId(profile.user_id); 

        // 🔥 3. TAWGON ANG PUSH SETUP DINHI
        setupPushNotifications(profile.user_id);
    }

    setLoginMethod(user.email ? "Email" : user.phone ? "Phone" : "User");
    setLoading(false);
  };

  const fetchUserBookingNotifications = async (userId: number) => {
    try {
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("id, equipment_name, status, created_at, approved_at, total_price, returned_at")
        .eq("user_id", userId)
        .in("status", ["approved", "in_use", "returned"])
        .order("created_at", { ascending: false })
        .limit(10); 

      if (!bookingsData) return;

      const now = moment();
      const newNotifications: UserBookingNotification[] = bookingsData
        .map((b) => {
            let title = "";
            let message = "";
            let display_icon = notificationsOutline;
            let display_color = "#000";
            let date = b.approved_at || b.created_at;

            if (b.status === 'approved') {
                title = "Booking Approved! 🎉";
                message = `Your booking for **${b.equipment_name}** has been approved.`;
                display_icon = checkmarkCircleOutline;
                display_color = "#28a745";
            } else if (b.status === 'in_use') {
                title = "Rental Started 🚜";
                message = `Your rental of **${b.equipment_name}** is now "In Use."`;
                display_icon = refreshOutline;
                display_color = "#ffc107";
            } else if (b.status === 'returned') {
                title = "Item Returned ✅";
                message = `Thank you for returning **${b.equipment_name}**.`;
                display_icon = timeOutline;
                display_color = "#17a2b8";
                date = b.returned_at || b.approved_at || b.created_at;
            }

            const isExpired = b.status === 'returned' && moment(date).add(RETURNED_EXPIRY_MINUTES, 'minutes').isBefore(now);

            return {
                id: b.id,
                title: title,
                message: message,
                status: b.status,
                created_at: date,
                is_expired: isExpired, 
                display_icon: display_icon, 
                display_color: display_color, 
                type: "booking" as "booking",
                is_read: false,
            };
        })
        .filter(n => !(n.status === 'returned' && n.is_expired));

      setUserBookingsNotifications(newNotifications);
    } catch (error) {
      console.error("Error fetching bookings notifications:", error);
    }
  };

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("id, title, message, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setNotifications(data);
  };

  useEffect(() => {
    fetchUserData();
    fetchNotifications();
  }, []); 

  useEffect(() => {
    if (currentUserId) {
      fetchUserBookingNotifications(currentUserId);
      const bookingChannel = supabase.channel(`user-bookings-${currentUserId}`).on("postgres_changes", { event: "*", schema: "public", table: "bookings", filter: `user_id=eq.${currentUserId}` }, () => fetchUserBookingNotifications(currentUserId)).subscribe();
      const notifChannel = supabase.channel("user-notifications").on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => fetchNotifications()).subscribe();

      return () => {
        supabase.removeChannel(bookingChannel);
        supabase.removeChannel(notifChannel);
      };
    }
  }, [currentUserId]); 

  // --- UI PART REMAINS THE SAME ---
  const allNotifications = [
    ...notifications.filter(n => !n.is_read).map(n => ({...n, type: 'standard', display_icon: notificationsOutline, display_color: '#6c757d'})), 
    ...userBookingsNotifications
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); 

  const totalUnreadCount = allNotifications.filter(n => !n.is_read).length;

  const handleLogout = async () => {
    // Logout Logic (Keep yours)
    await supabase.auth.signOut();
    localStorage.removeItem("userInfo");
    window.location.href = "/";
  };

  return (
    <IonHeader>
      <IonToolbar color="light">
        <IonTitle className="logo">
          <div>Member Dashboard</div>
          {!loading && <IonLabel style={{ fontSize: "0.8rem", color: "#555", marginLeft: "24px" }}>Welcome back, {userName}</IonLabel>}
        </IonTitle>
        <div slot="end" style={{ display: "flex", alignItems: "center", paddingRight: "10px" }}>
          {loading ? <IonSpinner name="crescent" /> : (
            <>
              <IonAvatar style={{ width: "35px", height: "35px" }}>
                {avatarUrl ? <IonImg src={avatarUrl} /> : <div style={{ background: "#2a62f3", color: "#fff", width: "100%", height: "100%", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{initials}</div>}
              </IonAvatar>

              <IonButton id="farmer-notif-btn" fill="clear">
                <IonIcon icon={notificationsOutline} />
                {totalUnreadCount > 0 && <IonBadge color="danger">{totalUnreadCount}</IonBadge>}
              </IonButton>

              <IonPopover trigger="farmer-notif-btn" triggerAction="click" side="bottom" alignment="end">
                <div style={{ padding: "10px", minWidth: "300px", maxHeight: "400px", overflowY: "auto" }}>
                  <h4 style={{ margin: "0 0 10px 0" }}>📢 Notifications</h4>
                  {allNotifications.length === 0 ? <IonLabel>No notifications</IonLabel> : (
                    allNotifications.map((notif) => (
                      <div key={notif.id} style={{ padding: "10px", borderLeft: `5px solid ${notif.display_color}`, background: "#f9f9f9", marginBottom: "5px", borderRadius: "4px" }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <IonIcon icon={notif.display_icon} style={{ color: notif.display_color, marginRight: "5px" }} />
                          <strong>{notif.title}</strong>
                        </div>
                        <p style={{ fontSize: "0.85rem", margin: "5px 0" }}>{notif.message}</p>
                        <small>{moment(notif.created_at).fromNow()}</small>
                      </div>
                    ))
                  )}
                </div>
              </IonPopover>

              <IonButton fill="clear" onClick={handleLogout}><IonIcon icon={logOutOutline} /></IonButton>
            </>
          )}
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default Farmer_HeaderBar;