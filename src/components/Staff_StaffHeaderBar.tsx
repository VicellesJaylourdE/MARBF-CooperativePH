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
  contractOutline,
  logOutOutline,
  notificationsOutline,
} from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";

const Staff_StaffHeaderBar: React.FC = () => {
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
          console.error("Profile fetch error:", profileError?.message);
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
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, message, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data) {
        setNotifications(data);
      }
    };

    fetchUserData();
    fetchNotifications();

    const channel = supabase
      .channel("staff-notifications-channel")
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

  return (
    <IonHeader>
      <IonToolbar color="light">
        <IonButtons slot="start">
          <IonMenuButton autoHide={false} />
        </IonButtons>

        <IonTitle
          className="logo"
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <IonIcon icon={contractOutline} style={{ marginRight: "8px" }} />
            Staff Portal
          </div>

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
                  <IonLabel style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                    {userName}
                  </IonLabel>
                  <br />
                  <IonLabel color="medium" style={{ fontSize: "0.75rem" }}>
                    Staff
                  </IonLabel>
                </div>
              )}

              <IonButton id="staff-notif-btn" fill="clear">
                <IonIcon icon={notificationsOutline} />
                {notifications.filter((n) => !n.is_read).length > 0 && (
                  <IonBadge color="danger">
                    {notifications.filter((n) => !n.is_read).length}
                  </IonBadge>
                )}
              </IonButton>

              <IonPopover trigger="staff-notif-btn" triggerAction="click">
                <div style={{ padding: "10px", minWidth: "250px" }}>
                  <h4 style={{ margin: "0 0 10px 0" }}>Notifications</h4>
                  {notifications.length === 0 ? (
                    <IonLabel>No notifications</IonLabel>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        maxHeight: "250px",
                        overflowY: "auto",
                      }}
                    >
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          style={{
                            padding: "8px",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            background: notif.is_read ? "#f9f9f9" : "#e8f0fe",
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
                      ))}
                    </div>
                  )}

                  {notifications.length > 0 && (
                    <div style={{ marginTop: "12px", textAlign: "right" }}>
                      <IonButton
                        size="small"
                        onClick={async () => {
                          const { error } = await supabase
                            .from("notifications")
                            .update({ is_read: true })
                            .eq("is_read", false);

                          if (error) console.error(error.message);
                        }}
                      >
                        Mark all as read
                      </IonButton>
                    </div>
                  )}
                </div>
              </IonPopover>

              <IonButton
                fill="clear"
                color={isLogoutClicked ? "warning" : "medium"}
                onClick={async () => {
                  setIsLogoutClicked(true);
                  setTimeout(() => setIsLogoutClicked(false), 200);

                  const { error } = await supabase.auth.signOut();
                  if (error) {
                    console.error("Logout error:", error.message);
                  } else {
                    window.location.href = "/MARBF-CooperativePH";
                  }
                }}
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

export default Staff_StaffHeaderBar;
