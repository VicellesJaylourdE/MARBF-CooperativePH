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
} from "@ionic/react";
import {
  contractOutline,
  logOutOutline,
  notificationsOutline,
} from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";

const HeaderBar: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [initials, setInitials] = useState<string>("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  const [isLogoutClicked, setIsLogoutClicked] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const email = user.email ?? "";
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Profile fetch error:", error.message);
          setUserName(email);
          setUserRole("User");
          setInitials(email.charAt(0).toUpperCase());
        } else if (profile) {
          const fullName = `${profile.first_name} ${profile.last_name}`;
          setUserName(fullName);
          setUserRole(profile.role || "Alumni");
          const init =
            (profile.first_name?.[0] || "").toUpperCase() +
            (profile.last_name?.[0] || "").toUpperCase();
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
      .channel("notifications-channel")
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
 
        <IonTitle
          className="logo"
          style={{ display: "flex", alignItems: "center" }}
        >
          <IonIcon icon={contractOutline} style={{ marginRight: "8px" }} />
          Coop PaBOOKid
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
                    {userRole}
                  </IonLabel>
                </div>
              )}

              <IonButton id="notif-btn" fill="clear">
                <IonIcon icon={notificationsOutline} />
                {notifications.filter((n) => !n.is_read).length > 0 && (
                  <IonBadge color="danger">
                    {notifications.filter((n) => !n.is_read).length}
                  </IonBadge>
                )}
              </IonButton>

              <IonPopover trigger="notif-btn" triggerAction="click">
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

export default HeaderBar;
