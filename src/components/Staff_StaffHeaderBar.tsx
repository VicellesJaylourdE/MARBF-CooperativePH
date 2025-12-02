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
  IonButton,
  IonSpinner,
  IonLabel,
} from "@ionic/react";
import { logOutOutline, notificationsOutline } from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";

const Staff_StaffHeaderBar: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("User");
  const [initials, setInitials] = useState<string>("U");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [isLogoutClicked, setIsLogoutClicked] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Auth error:", authError.message);
        setLoading(false);
        return;
      }
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("username, user_avatar_url")
          .eq("user_email", user.email)
          .single();
        if (profileError || !profile) {
          setUserName("User");
          setInitials("U");
          setAvatarUrl(null);
        } else {
          const username = profile.username;
          setUserName(username);
          const init = username.split(" ").map((n: string) => n[0]?.toUpperCase()).join("");
          setInitials(init);
          setAvatarUrl(profile.user_avatar_url || null);
        }
      }
      setLoading(false);
    };

    const fetchNotifications = async () => {
      const { data } = await supabase.from("notifications").select("id, title, message, is_read, created_at").order("created_at", { ascending: false }).limit(5);
      if (data) setNotifications(data);
    };

    fetchUserData();
    fetchNotifications();

    const channel = supabase
      .channel("staff-notifications-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
          fetchNotifications();
        }
      )
      .subscribe();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setIsLogoutClicked(true);
      setTimeout(() => setIsLogoutClicked(false), 200);
      const stored = localStorage.getItem("userInfo");
      if (stored) {
        const user = JSON.parse(stored);
        const { data: lastLog } = await supabase.from("activity_logs").select("*").eq("user_id", user.id).order("date_in", { ascending: false }).limit(1).single();
        if (lastLog) {
          await supabase.from("activity_logs").update({ date_out: new Date() }).eq("log_id", lastLog.log_id);
        }
      }
      await supabase.auth.signOut();
      localStorage.removeItem("userInfo");
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleProfileClick = () => {
    // I-redirect sa My Profile tab sa dashboard
    // Note: Sa main dashboard component (StaffDashboard), kinahanglan nimo i-handle ang 'myprofile' tab.
    history.push('/staff/myprofile'); 
  };

  return (
    <IonHeader class="ion-no-border">
      <IonToolbar color="light" class="ion-no-border">
        <IonButtons slot="start">
          <IonMenuButton autoHide={false} menu="staff-menu" />
        </IonButtons>
        <IonTitle style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center" }}>Staff Dashboard</div>
          {!loading && (
            <IonLabel style={{ fontSize: "0.8rem", color: "#555", marginLeft: "24px" }}>
              Welcome back, {userName}
            </IonLabel>
          )}
        </IonTitle>
        <div style={{ position: "absolute", right: "1rem", top: "0.3rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {loading ? ( <IonSpinner name="crescent" /> ) : (
            <>
              <IonAvatar style={{ width: "35px", height: "35px", cursor: "pointer" }} onClick={handleProfileClick}>
                {avatarUrl ? (
                  <IonImg src={avatarUrl} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                ) : (
                  <div style={{ backgroundColor: "#2a62f3", color: "#fff", width: "100%", height: "100%", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                    {initials}
                  </div>
                )}
              </IonAvatar>
              {!isMobile && (
                <div style={{ textAlign: "right", marginRight: "4px" }}>
                  <IonLabel style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{userName}</IonLabel><br />
                  <IonLabel color="medium" style={{ fontSize: "0.75rem" }}>Staff</IonLabel>
                </div>
              )}
              <IonButton id="staff-notif-btn" fill="clear">
                <IonIcon icon={notificationsOutline} />
                {notifications.some((n) => !n.is_read) && (
                  <IonBadge color="danger">{notifications.filter((n) => !n.is_read).length}</IonBadge>
                )}
              </IonButton>
              <IonPopover trigger="staff-notif-btn" triggerAction="click">
                <div style={{ padding: "10px", minWidth: "250px" }}>
                  <h4>Notifications</h4>
                  {notifications.length === 0 ? ( <IonLabel>No notifications</IonLabel> ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "8px", background: notif.is_read ? "#f9f9f9" : "#e8f0fe", marginBottom: "6px" }}>
                        <strong>{notif.title}</strong><br />
                        <IonLabel>{notif.message}</IonLabel><br />
                        <small style={{ color: "#777" }}>{new Date(notif.created_at).toLocaleString()}</small>
                      </div>
                    ))
                  )}
                </div>
              </IonPopover>
              <IonButton fill="clear" color={isLogoutClicked ? "warning" : "medium"} onClick={handleLogout}>
                <IonIcon icon={logOutOutline} />
              </IonButton>
            </>
          )}
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default Staff_StaffHeaderBar;