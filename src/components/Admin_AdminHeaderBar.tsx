import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonIcon,
  IonAvatar,
  IonBadge,
  IonPopover,
  IonButtons,
  IonMenuButton,
  IonImg,
  IonLabel,
  IonSpinner,
  IonButton,
} from "@ionic/react";
import { logOutOutline, notificationsOutline } from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";

// 1. 🔥 IMPORT PARA SA PUSH NOTIFICATIONS
import { PushNotifications } from "@capacitor/push-notifications";

const Admin_AdminHeaderBar: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("User");
  const [initials, setInitials] = useState<string>("U");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [isLogoutClicked, setIsLogoutClicked] = useState(false);
  const [pendingBookingsCount, setPendingBookingsCount] = useState<number>(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  
  const history = useHistory();

  // 2. 🔥 FUNCTION PARA SA SETUP SA PUSH NOTIFICATIONS
  const setupPushNotifications = async (userId: number) => {
    try {
      // Pangayo og permiso sa cellphone
      let perm = await PushNotifications.checkPermissions();
      if (perm.receive !== 'granted') {
        perm = await PushNotifications.requestPermissions();
      }

      if (perm.receive === 'granted') {
        // I-register ang device sa Firebase
        await PushNotifications.register();
      }

      // Inig makuha na ang Token, i-save sa Supabase users table
      PushNotifications.addListener('registration', async (token) => {
        console.log("FCM Token nakuha:", token.value);
        await supabase
          .from("users")
          .update({ fcm_token: token.value }) // Siguroha nga naa ni nga column sa imong SQL
          .eq("user_id", userId);
      });

      // Listener kon naay mo-abot nga notif samtang abli ang app
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log("Naay push notification:", notification);
        fetchNotifications(); 
        fetchPendingBookingsCount(); 
      });

    } catch (err) {
      console.error("Push Setup Error:", err);
    }
  };

  const fetchPendingBookingsCount = async () => {
    setLoadingNotifications(true);
    try {
      const { count, error } = await supabase
        .from("bookings")
        .select("id", { count: "exact" })
        .eq("status", "pending");
      if (error) throw error;
      setPendingBookingsCount(count ?? 0);
    } catch (error: any) {
      console.error("Error fetching count:", error.message);
    } finally {
      setLoadingNotifications(false);
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
    const fetchUserDataAndNotifications = async () => {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("user_id, username, user_avatar_url, user_firstname, user_lastname")
          .eq("user_email", user.email)
          .single();
          
        if (profile) {
          const displayName = profile.username || `${profile.user_firstname || ''} ${profile.user_lastname || ''}`.trim() || `User ${profile.user_id}`;
          setUserName(displayName);
          const init = displayName.split(" ").map((n: string) => n[0]?.toUpperCase()).join("");
          setInitials(init.substring(0, 2));
          setAvatarUrl(profile.user_avatar_url || null);

          localStorage.setItem("userInfo", JSON.stringify({ id: profile.user_id, email: user.email }));

          // 3. 🔥 TAWGON ANG PUSH SETUP DINHI
          setupPushNotifications(profile.user_id);
        }
      }
      
      await fetchNotifications();
      await fetchPendingBookingsCount();
      setLoading(false);
    };

    fetchUserDataAndNotifications();

    const notifChannel = supabase.channel("admin-notifs").on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => fetchNotifications()).subscribe();
    const bookingChannel = supabase.channel("pending-bookings").on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => fetchPendingBookingsCount()).subscribe();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    return () => {
      supabase.removeChannel(notifChannel);
      supabase.removeChannel(bookingChannel);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogout = async () => {
    setIsLogoutClicked(true);
    try {
      const stored = localStorage.getItem("userInfo");
      if (stored) {
        const user = JSON.parse(stored);
        const { data: lastLog } = await supabase.from("activity_logs").select("*").eq("user_id", user.id).order("date_in", { ascending: false }).limit(1).single();
        if (lastLog) {
          await supabase.from("activity_logs").update({ date_out: new Date().toISOString() }).eq("log_id", lastLog.log_id);
        }
      }
      await supabase.auth.signOut();
      localStorage.removeItem("userInfo");
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLogoutClicked(false);
    }
  };

  const totalUnreadCount = notifications.filter((n) => !n.is_read).length + pendingBookingsCount;

  return (
    <IonHeader className="ion-no-border">
      <IonToolbar color="light">
        <IonButtons slot="start">
          <IonMenuButton autoHide={false} menu="admin-menu" />
        </IonButtons>
        <IonTitle>
          <div style={{ fontSize: "1.1rem" }}>Admin Dashboard</div>
          {!loading && <div style={{ fontSize: "0.75rem", color: "#666", marginLeft: "24px" }}>Welcome back, {userName}</div>}
        </IonTitle>

        <div slot="end" style={{ display: "flex", alignItems: "center", paddingRight: "10px" }}>
          {loading ? <IonSpinner name="crescent" /> : (
            <>
              <IonAvatar style={{ width: "35px", height: "35px", cursor: "pointer" }} onClick={() => history.push('/admin/myprofile')}>
                {avatarUrl ? <IonImg src={avatarUrl} /> : <div style={{ background: "#2a62f3", color: "#fff", height: "100%", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{initials}</div>}
              </IonAvatar>

              <IonButton id="admin-notif-btn" fill="clear">
                <IonIcon icon={notificationsOutline} />
                {totalUnreadCount > 0 && <IonBadge color="danger">{totalUnreadCount}</IonBadge>}
              </IonButton>

              <IonPopover trigger="admin-notif-btn" triggerAction="click" side="bottom" alignment="end">
                <div style={{ padding: "10px", minWidth: "250px" }}>
                  <h4 style={{ margin: "5px 0" }}>📢 Notifications</h4>
                  {pendingBookingsCount > 0 && (
                    <div style={{ padding: "8px", background: "#fff3e0", borderRadius: "8px", marginBottom: "5px" }}>
                      <strong>🚨 {pendingBookingsCount} Pending Bookings</strong>
                    </div>
                  )}
                  {notifications.map(n => (
                    <div key={n.id} style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                      <strong>{n.title}</strong><br/><small>{n.message}</small>
                    </div>
                  ))}
                </div>
              </IonPopover>

              <IonButton fill="clear" onClick={handleLogout}>
                <IonIcon icon={logOutOutline} />
              </IonButton>
            </>
          )}
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default Admin_AdminHeaderBar;