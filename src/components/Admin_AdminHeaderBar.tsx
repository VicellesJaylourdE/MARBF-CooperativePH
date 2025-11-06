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
  IonMenuButton,
} from "@ionic/react";
import {
  logOutOutline,
  notificationsOutline,
} from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";

const Admin_AdminHeaderBar: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("User");
  const [initials, setInitials] = useState<string>("U");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [isLogoutClicked, setIsLogoutClicked] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("Auth error:", authError.message);
        setLoading(false);
        return;
      }

      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("username")
          .eq("user_email", user.email)
          .single();

        if (profileError || !profile) {
          setUserName("User");
          setInitials("U");
        } else {
          const username = profile.username;
          setUserName(username);
          const init = username
            .split(" ")
            .map((n: string) => n[0]?.toUpperCase())
            .join("");
          setInitials(init);
        }
      }

      setLoading(false);
    };

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("id, title, message, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) setNotifications(data);
    };

    fetchUserData();
    fetchNotifications();

    const channel = supabase
      .channel("admin-notifications-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
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

  // ✅ LOGOUT WITH ACTIVITY LOG UPDATE
  const handleLogout = async () => {
    try {
      const stored = localStorage.getItem("userInfo");
      if (stored) {
        const user = JSON.parse(stored);

        const { data: lastLog } = await supabase
          .from("activity_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("date_in", { ascending: false })
          .limit(1)
          .single();

        if (lastLog) {
          await supabase
            .from("activity_logs")
            .update({ date_out: new Date() })
            .eq("log_id", lastLog.log_id);
        }
      }

      await supabase.auth.signOut();
      localStorage.removeItem("userInfo");
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <IonHeader>
      <IonToolbar color="light">
        <IonButtons slot="start">
          <IonMenuButton autoHide={false} />
        </IonButtons>

        <IonTitle style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center" }}>Admin Portal</div>
          {!loading && (
            <IonLabel style={{ fontSize: "0.8rem", color: "#555", marginLeft: "24px" }}>
              Welcome back, {userName}
            </IonLabel>
          )}
        </IonTitle>

        <div
          style={{
            position: "absolute",
            right: "1rem",
            top: "0.3rem",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
          }}
        >
          {loading ? (
            <IonSpinner name="crescent" />
          ) : (
            <>
              <IonAvatar style={{ width: "35px", height: "35px" }}>
                <div
                  style={{
                    backgroundColor: "#2a62f3",
                    color: "#fff",
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                >
                  {initials}
                </div>
              </IonAvatar>

              {!isMobile && (
                <div style={{ textAlign: "right", marginRight: "4px" }}>
                  <IonLabel style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{userName}</IonLabel>
                  <br />
                  <IonLabel color="medium" style={{ fontSize: "0.75rem" }}>
                    Admin
                  </IonLabel>
                </div>
              )}

              <IonButton id="admin-notif-btn" fill="clear">
                <IonIcon icon={notificationsOutline} />
                {notifications.some((n) => !n.is_read) && (
                  <IonBadge color="danger">
                    {notifications.filter((n) => !n.is_read).length}
                  </IonBadge>
                )}
              </IonButton>

              <IonPopover trigger="admin-notif-btn" triggerAction="click">
                <div style={{ padding: "10px", minWidth: "250px" }}>
                  <h4>Notifications</h4>
                  {notifications.length === 0 ? (
                    <IonLabel>No notifications</IonLabel>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          background: notif.is_read ? "#f9f9f9" : "#e8f0fe",
                          marginBottom: "6px",
                        }}
                      >
                        <strong>{notif.title}</strong>
                        <br />
                        <IonLabel>{notif.message}</IonLabel>
                        <br />
                        <small style={{ color: "#777" }}>
                          {new Date(notif.created_at).toLocaleString()}
                        </small>
                      </div>
                    ))
                  )}
                </div>
              </IonPopover>

              {/* ✅ REPLACED LOGOUT BUTTON */}
              <IonButton
                fill="clear"
                color={isLogoutClicked ? "warning" : "medium"}
                onClick={handleLogout}
              >
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
