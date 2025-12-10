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
    checkmarkCircleOutline, // For Approved
    refreshOutline, // For In Use
    timeOutline, // For Returned/Temp
} from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import moment from 'moment'; // Import moment for date comparison and formatting

interface UserBookingNotification {
    id: string; // Booking ID
    title: string;
    message: string;
    status: 'approved' | 'in_use' | 'returned'; 
    created_at: string;
    is_expired: boolean; // True if 'returned' and past the 10-min limit
    display_icon: string;
    display_color: string;
    type: 'booking';
    is_read: boolean; // For combined list logic
}

const Farmer_HeaderBar: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("User");
  const [initials, setInitials] = useState<string>("U");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]); // Standard notifications
  
  // State for individual booking notifications
  const [userBookingsNotifications, setUserBookingsNotifications] = useState<UserBookingNotification[]>([]);
  
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [loginMethod, setLoginMethod] = useState<string>("User");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // TIME CONSTANT FOR RETURNED NOTIFICATION EXPIRY (10 minutes)
  const RETURNED_EXPIRY_MINUTES = 10;

  // Function to fetch user data
  const fetchUserData = async () => {
    setLoading(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError?.message);
      setLoading(false);
      return;
    }
    
    // Fetch profile info (User ID is necessary)
    const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("user_id, username, user_avatar_url, user_phone")
        .eq(user.email ? "user_email" : "user_phone", user.email || user.phone)
        .single();

    if (profileError || !profile) {
      setUserName("User");
      setInitials("U");
      setAvatarUrl(null);
    } else {
        const username = profile.username || "User";
        const initials = username
            .split(" ")
            .map((n: string) => n[0]?.toUpperCase())
            .join("");
        setUserName(username);
        setInitials(initials);
        setAvatarUrl(profile.user_avatar_url || null);
        
        // I-save ang user_id
        setCurrentUserId(profile.user_id); 
    }

    const method = user.email ? "Email" : user.phone ? "Phone" : "User";
    setLoginMethod(method);
    
    setLoading(false);
  };

  // FUNCTION: Para mokuha sa listahan sa Bookings isip Notifications
  const fetchUserBookingNotifications = async (userId: number) => {
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("id, equipment_name, status, created_at, approved_at, total_price, returned_at")
        .eq("user_id", userId)
        .in("status", ["approved", "in_use", "returned"])
        .order("created_at", { ascending: false })
        .limit(10); 

      if (bookingsError) throw bookingsError;

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
                message = `Your booking for **${b.equipment_name}** has been approved. Total price: ₱${b.total_price?.toLocaleString() || 'N/A'}.`;
                display_icon = checkmarkCircleOutline;
                display_color = "#28a745"; // Green
            } else if (b.status === 'in_use') {
                title = "Rental Started 🚜";
                message = `Your rental of **${b.equipment_name}** is now officially "In Use."`;
                display_icon = refreshOutline;
                display_color = "#ffc107"; // Yellow/Orange
            } else if (b.status === 'returned') {
                title = "Item Returned ✅ (Temp)";
                message = `Thank you for returning **${b.equipment_name}**. This notification will disappear soon.`;
                display_icon = timeOutline;
                display_color = "#17a2b8"; // Blue/Cyan
                date = b.returned_at || b.approved_at || b.created_at; // Use returned_at 
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
                is_read: false, // Assume unread until user visits page
            };
        })
        .filter(n => !(n.status === 'returned' && n.is_expired)); // FILTER OUT EXPIRED 'RETURNED' NOTIFICATIONS

      setUserBookingsNotifications(newNotifications as UserBookingNotification[]);
    } catch (error: any) {
      console.error("Error fetching user bookings notifications:", error.message);
      setUserBookingsNotifications([]);
    }
  };

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, message, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) setNotifications(data);
  };

  useEffect(() => {
    const initData = async () => {
      await fetchUserData();
      await fetchNotifications();
    };
    initData();
  }, []); 

  useEffect(() => {
    // Kinahanglan naa na ang user ID para mag-subscribe sa Bookings
    if (currentUserId) {
      fetchUserBookingNotifications(currentUserId);
      
      // Realtime Listener for Bookings
      const bookingChannel = supabase
        .channel(`user-bookings-${currentUserId}-channel`)
        .on(
          "postgres_changes",
          { 
            event: "*", 
            schema: "public", 
            table: "bookings",
            filter: `user_id=eq.${currentUserId}` 
          },
          () => fetchUserBookingNotifications(currentUserId!)
        )
        .subscribe();
      
      // Realtime Listener for Standard Notifications (already existing)
      const notifChannel = supabase
        .channel("user-notifications-channel")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "notifications" },
          () => fetchNotifications()
        )
        .subscribe();

      // Cleanup for both channels
      return () => {
        supabase.removeChannel(bookingChannel);
        supabase.removeChannel(notifChannel);
      };
    }
  }, [currentUserId]); 

  useEffect(() => {
    // Resize handler (existing)
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  const handleLogout = async () => {
    try {
      // Logout logic (no change)
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
            .update({ date_out: new Date().toISOString() }) 
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

  // Combine all notifications for display and counting
  const allNotifications = [
    // Combine standard notifications (filter read/unread on is_read)
    ...notifications.filter(n => !n.is_read).map(n => ({...n, type: 'standard', is_read: n.is_read, display_icon: notificationsOutline, display_color: '#6c757d'})), 
    
    // Combine booking notifications (already filtered for expired returns)
    ...userBookingsNotifications
    
].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); 

  // Total Unread Count
  const totalUnreadCount = allNotifications.filter(n => !n.is_read).length;


  return (
    <IonHeader>
      <IonToolbar color="light">
        <IonButtons slot="start"></IonButtons>

        <IonTitle
          className="logo"
          style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>Member Dashboard</div>
          {!loading && (
            <IonLabel style={{ fontSize: "0.8rem", color: "#555", marginLeft: "24px" }}>
              Welcome back, **{userName}**
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
              {/* Avatar or initials */}
              <IonAvatar style={{ width: "35px", height: "35px" }}>
                {avatarUrl ? (
                  <IonImg
                    src={avatarUrl}
                    style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                  />
                ) : (
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
                )}
              </IonAvatar>

              {/* User Info */}
              {!isMobile && (
                <div style={{ textAlign: "right", marginRight: "4px" }}>
                  <IonLabel style={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                    {userName}
                  </IonLabel>
                  <br />
                  <IonLabel color="medium" style={{ fontSize: "0.75rem" }}>
                    {loginMethod}
                  </IonLabel>
                </div>
              )}

              {/* Notifications Badge */}
              <IonButton id="admin-notif-btn" fill="clear">
                <IonIcon icon={notificationsOutline} />
                {totalUnreadCount > 0 && (
                  <IonBadge color="danger">
                    {totalUnreadCount}
                  </IonBadge>
                )}
              </IonButton>

              
              <IonPopover trigger="admin-notif-btn" triggerAction="click" side="bottom" alignment="end">
                <div style={{ padding: "10px", minWidth: "350px" }}>
                  <h4 style={{ margin: "0 0 10px 0" }}>📢 Notifications ({totalUnreadCount} New)</h4>

                  {allNotifications.length === 0 ? (
                    <IonLabel>No notifications</IonLabel>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        maxHeight: "300px",
                        overflowY: "auto",
                      }}
                    >
                      {allNotifications.map((notif: any) => (
                        <div
                          key={notif.type === 'booking' ? `booking-${notif.id}` : `standard-${notif.id}`}
                       
                         
                          style={{
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                         
                            background: notif.type === 'booking' ? 
                                (notif.status === 'approved' ? "#e6ffe6" : 
                                 notif.status === 'in_use' ? "#fff7e6" : 
                                 notif.status === 'returned' ? "#e6f7ff" : "#f9f9f9") 
                                : (notif.is_read ? "#f9f9f9" : "#f0f8ff"),
                            borderLeft: `5px solid ${notif.display_color}`, // Colored border
                            cursor: notif.type === 'booking' ? 'pointer' : 'default',
                            boxShadow: notif.is_read ? 'none' : '0 1px 3px rgba(0,0,0,0.08)'
                          }}
                        >
                          <div style={{display: 'flex', alignItems: 'center', marginBottom: '4px'}}>
                              <IonIcon 
                                  icon={notif.display_icon} 
                                  style={{marginRight: '8px', color: notif.display_color}} 
                              />
                              <strong>{notif.title}</strong>
                          </div>
                          <IonLabel style={{fontSize: '0.9rem'}}>{notif.message}</IonLabel> <br />
                          <small style={{ color: "#777", marginTop: '4px', display: 'block' }}>
                              {moment(notif.created_at).fromNow()} ({moment(notif.created_at).format('MMM DD, h:mm A')})
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </IonPopover>

              {/* Logout */}
              <IonButton fill="clear" color="medium" onClick={handleLogout}>
                <IonIcon icon={logOutOutline} />
              </IonButton>
            </>
          )}
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default Farmer_HeaderBar;