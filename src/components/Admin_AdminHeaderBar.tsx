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
import {
  logOutOutline,
  notificationsOutline,
} from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";

// Kini nga component nag-display sa Admin User Name ug Pending Bookings Count.

const Admin_AdminHeaderBar: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("User");
  const [initials, setInitials] = useState<string>("U");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [isLogoutClicked, setIsLogoutClicked] = useState(false);
  
  // State para sa pending bookings count
  const [pendingBookingsCount, setPendingBookingsCount] = useState<number>(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  
  const history = useHistory();

  // Function to fetch the count of pending bookings
  const fetchPendingBookingsCount = async () => {
    setLoadingNotifications(true);
    try {
      // I-fetch ang count sa bookings nga 'pending' ang status
      const { count, error } = await supabase
        .from("bookings")
        .select("id", { count: "exact" })
        .eq("status", "pending");

      if (error) throw error;

      setPendingBookingsCount(count ?? 0);
    } catch (error: any) {
      console.error("Error fetching pending bookings count:", error.message);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    const fetchUserDataAndNotifications = async () => {
      setLoading(true);
      
      // 1. Fetch Admin User Data (Para sa Header Bar)
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Auth error:", authError.message);
        setLoading(false);
        return;
      }
      
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("user_id, username, user_avatar_url, user_firstname, user_lastname")
          .eq("user_email", user.email)
          .single();
          
        if (profileError || !profile) {
          setUserName("Admin User");
          setInitials("AU");
          setAvatarUrl(null);
        } else {
          // Determine the display name (Use username or combined first/last name)
          const displayName = profile.username || `${profile.user_firstname || ''} ${profile.user_lastname || ''}`.trim() || `User ${profile.user_id}`;
          
          setUserName(displayName);
          const init = displayName.split(" ").map((n: string) => n[0]?.toUpperCase()).join("");
          setInitials(init.substring(0, 2));
          setAvatarUrl(profile.user_avatar_url || null);

          // Save minimal user info to localStorage for logging out
          localStorage.setItem("userInfo", JSON.stringify({ 
              id: profile.user_id, 
              email: user.email 
          }));
        }
      }
      
      // 2. Fetch Notifications and Pending Bookings
      await fetchNotifications();
      await fetchPendingBookingsCount();
      
      setLoading(false);
    };

    const fetchNotifications = async () => {
      // I-fetch ang standard notifications
      const { data } = await supabase
        .from("notifications")
        .select("id, title, message, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setNotifications(data);
    };

    fetchUserDataAndNotifications(); // Initial fetch

    // --- Realtime Subscriptions ---
    
    // Channel para sa NOTIFICATIONS
    const notifChannel = supabase
      .channel("admin-notifications-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
          fetchNotifications();
        }
      )
      .subscribe();

    // Channel para sa BOOKINGS (para sa badge count)
    const bookingChannel = supabase
      .channel("pending-bookings-channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
            // Kon naay bisan unsang change sa bookings, i-refresh ang count
            fetchPendingBookingsCount();
      })
      .subscribe();


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
      
      // 1. Log Activity (Date Out)
      if (stored) {
        const user = JSON.parse(stored);
        
        // Find the last login entry for this user
        const { data: lastLog } = await supabase
          .from("activity_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("date_in", { ascending: false })
          .limit(1)
          .single();
          
        // Update date_out if an entry is found
        if (lastLog) {
          await supabase
            .from("activity_logs")
            .update({ date_out: new Date().toISOString() })
            .eq("log_id", lastLog.log_id);
        }
      }
      
      // 2. Sign out from Supabase
      await supabase.auth.signOut();
      
      // 3. Cleanup and Redirect
      localStorage.removeItem("userInfo");
      window.location.href = "/"; // Redirect sa login page
      
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
        setIsLogoutClicked(false);
    }
  };

  const handleProfileClick = () => {
    history.push('/admin/myprofile'); 
  };

  // Kalkulahon ang total unread count (Standard Notifications + Pending Bookings)
  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;
  const totalUnreadCount = unreadNotificationsCount + pendingBookingsCount;


  return (
    <IonHeader class="ion-no-border">
      <IonToolbar color="light" class="ion-no-border">
        <IonButtons slot="start">
          <IonMenuButton autoHide={false} menu="admin-menu" />
        </IonButtons>
        <IonTitle style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center" }}>Admin Dashboard</div>
          {!loading && (
            <IonLabel style={{ fontSize: "0.8rem", color: "#555", marginLeft: "24px" }}>
              Welcome back, {userName}
            </IonLabel>
          )}
        </IonTitle>
        <div style={{ position: "absolute", right: "1rem", top: "0.3rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {loading ? ( <IonSpinner name="crescent" /> ) : (
            <>
              {/* User Avatar */}
              <IonAvatar style={{ width: "35px", height: "35px", cursor: "pointer" }} onClick={handleProfileClick}>
                {avatarUrl ? (
                  <IonImg src={avatarUrl} style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
                ) : (
                  <div style={{ backgroundColor: "#2a62f3", color: "#fff", width: "100%", height: "100%", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                    {initials}
                  </div>
                )}
              </IonAvatar>
              
              {/* User Name and Role */}
              {!isMobile && (
                <div style={{ textAlign: "right", marginRight: "4px" }}>
                  <IonLabel style={{ fontWeight: "bold", fontSize: "0.9rem" }}>{userName}</IonLabel><br />
                  <IonLabel color="medium" style={{ fontSize: "0.75rem" }}>Admin</IonLabel>
                </div>
              )}
              
              {/* Notification Button and Badge */}
              <IonButton id="admin-notif-btn" fill="clear">
                <IonIcon icon={notificationsOutline} />
                {loadingNotifications && <IonSpinner name="dots" style={{ marginLeft: '4px' }} />}
                {totalUnreadCount > 0 && ( 
                  <IonBadge color="danger">{totalUnreadCount}</IonBadge>
                )}
              </IonButton>

              {/* Notification Popover */}
              <IonPopover trigger="admin-notif-btn" triggerAction="click" side="bottom" alignment="end">
                <div style={{ padding: "10px", minWidth: "250px", maxWidth: "300px" }}>
                  <h4>📢 Notifications ({totalUnreadCount} Unread)</h4>
                  
                  {/* Pending Bookings Alert */}
                  {pendingBookingsCount > 0 && (
                      <div style={{ padding: "8px", border: "1px solid #ff9800", borderRadius: "8px", background: "#fff3e0", marginBottom: "6px", cursor: 'pointer' }}
                        onClick={() => {
                            const popover = document.getElementById('admin-notif-btn')?.closest('ion-popover');
                            if (popover) popover.dismiss();
                          
                        }}
                      >
                          <strong>🚨 New Pending Bookings</strong><br />
                          <IonLabel>{pendingBookingsCount} booking(s) pending approval.</IonLabel><br />
                          <small style={{ color: "#777" }}>Click to manage bookings.</small>
                      </div>
                  )}

                  {/* Standard Notifications */}
                  {notifications.length === 0 && pendingBookingsCount === 0 ? ( 
                      <IonLabel>No notifications</IonLabel> 
                  ) : (
                      notifications.map((notif) => (
                          <div key={notif.id} style={{ padding: "8px", border: "1px solid #ddd", borderRadius: "8px", background: notif.is_read ? "#f9f9f9" : "#e8f0fe", marginBottom: "6px", opacity: notif.is_read ? 0.7 : 1 }}>
                            <strong>{notif.title}</strong><br />
                            <IonLabel>{notif.message}</IonLabel><br />
                            <small style={{ color: "#777" }}>{new Date(notif.created_at).toLocaleTimeString()}</small>
                          </div>
                      ))
                  )}
                </div>
              </IonPopover>
              
              {/* Logout Button */}
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

export default Admin_AdminHeaderBar;