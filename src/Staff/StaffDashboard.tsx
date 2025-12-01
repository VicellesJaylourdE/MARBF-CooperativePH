import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  // Imports para sa Dashboard
  IonPage,
  IonSplitPane, // Bisan dili na gamiton sa main layout, naa gihapon ang import
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonButton,
  
  // Imports para sa HeaderBar
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
  
  // Imports para sa Sidebar
  IonList,
  IonMenu,
  IonFooter,
} from "@ionic/react";

import {
  // Imports para sa HeaderBar
  logOutOutline,
  notificationsOutline,
  
  // Imports para sa Sidebar
  homeOutline,
  calendarOutline,
  peopleOutline,
  barChartOutline,
  bookOutline,
  settingsOutline,
  printOutline,
  personCircleOutline,
  hammerOutline, // Para sa Equipment List
} from "ionicons/icons";

import { supabase } from "../utils/supabaseClient";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Imong mga Staff components (gikuha sa imong gi-paste)
import GenerateReports from "../components/Staff_GenerateReports ";
import Staff_UsersTab from "../components/Staff_UsersTab";
import ViewBookingCalendar from "../components/Staff_ViewBookingCalendar";
import ViewAllTransactions from "./Staff_ViewAllTransactions";
import ManageRentalBookings from "./ManageRentalBookings";
import EquipmentList from "../components/Staff_EquipmentList";
import Staff_MyProfile from "../components/Staff_MyProfile";

const DashboardStyles: React.FC = () => (
  <style>{`
    /* --- Styling para sa Active Sidebar Item --- */
    .active-sidebar-item {
      --background: rgba(var(--ion-color-primary-rgb), 0.1);
      --color: var(--ion-color-primary);
      border-radius: 8px;
      margin-left: 8px;
      margin-right: 8px;
      width: auto;
    }

    .active-sidebar-item ion-icon {
      color: var(--ion-color-primary);
    }
    /* --- End sa Sidebar Styling --- */

    ion-card {
      box-shadow: none !important;
      --border-width: 0px !important;
      /* border: 1px solid #e0e0e0; */
    }

    ion-card-header {
      --border-width: 0px !important;
    }

    ion-card-header ion-item {
      --background: transparent;
      --inner-border-width: 0px;
    }
  `}</style>
);

const Staff_StaffHeaderBar: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("User");
  const [initials, setInitials] = useState<string>("U");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null); 
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [isLogoutClicked, setIsLogoutClicked] = useState(false);
  const history = useHistory(); // Gidugang para sa profile click

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
          .select("username, user_avatar_url") // Gikuha na ang avatar
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
          setAvatarUrl(profile.user_avatar_url || null); // G-set ang avatar
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
      .channel("staff-notifications-channel") // Gi-ilisdan sa "staff"
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
  
  // Gidugang ang profile click handler para sa staff
  const handleProfileClick = () => {
    history.push('/staff/myprofile'); 
  };

  return (
    // Gi-apply ang "chada" style (flat ug light gray)
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
              {/* Gi-update na ang Avatar Logic ug naay onClick */}
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


// ===================================================================
// 2. Staff_StaffSidebar COMPONENT (Gi-style ug gi-update ang items)
// ===================================================================
interface StaffSidebarProps {
  setActiveTab: (tab: string) => void;
  activeTab: string; 
}

const Staff_StaffSidebar: React.FC<StaffSidebarProps> = ({ 
  setActiveTab, 
  activeTab 
}) => {

  return (
    <IonMenu 
      menuId="staff-menu" // Gi-ilisdan sa "staff-menu"
      contentId="main-dashboard-content"
      type="overlay" // "overlay" para dili mo-isbog
      side="start" 
      style={{ "--border": "0px", "--box-shadow": "none" }}
    > 
      
      {/* Gaan ug flat nga background */}
      <IonContent 
        color="light" 
        style={{
          "--padding-start": "8px", 
          "--padding-end": "8px",
          "--padding-top": "20px" 
        }}
      >
        <IonList lines="none"> 
          
          <IonItem button onClick={() => setActiveTab("dashboard")} className={activeTab === "dashboard" ? "active-sidebar-item" : ""} color="light">
            <IonIcon icon={homeOutline} slot="start" />
            <IonLabel>Dashboard</IonLabel>
          </IonItem>

          {/* Gi-update ang menu items base sa imong Staff imports */}
          <IonItem button onClick={() => setActiveTab("users")} className={activeTab === "users" ? "active-sidebar-item" : ""} color="light">
            <IonIcon icon={peopleOutline} slot="start" />
            <IonLabel>Create User</IonLabel>
          </IonItem>

          <IonItem button onClick={() => setActiveTab("equipmentlist")} className={activeTab === "equipmentlist" ? "active-sidebar-item" : ""} color="light">
            <IonIcon icon={hammerOutline} slot="start" />
            <IonLabel>Equipment List</IonLabel>
          </IonItem>

          <IonItem button onClick={() => setActiveTab("managerentalbookings")} className={activeTab === "managerentalbookings" ? "active-sidebar-item" : ""} color="light">
            <IonIcon icon={barChartOutline} slot="start" />
            <IonLabel>Manage Rental Bookings</IonLabel>
          </IonItem>

          <IonItem button onClick={() => setActiveTab("viewbookingcalendar")} className={activeTab === "viewbookingcalendar" ? "active-sidebar-item" : ""} color="light">
            <IonIcon icon={calendarOutline} slot="start" />
            <IonLabel>View Booking Calendar</IonLabel>
          </IonItem>

          <IonItem button onClick={() => setActiveTab("viewalltransactions")} className={activeTab === "viewalltransactions" ? "active-sidebar-item" : ""} color="light">
            <IonIcon icon={bookOutline} slot="start" />
            <IonLabel>View All Transactions</IonLabel>
          </IonItem>
          
          <IonItem button onClick={() => setActiveTab("generatereports")} className={activeTab === "generatereports" ? "active-sidebar-item" : ""} color="light">
            <IonIcon icon={printOutline} slot="start" />
            <IonLabel>Generate Reports</IonLabel>
          </IonItem>

        </IonList>
      </IonContent>

      <IonFooter class="ion-no-border" color="light">
        <IonList lines="none" style={{"--padding-start": "8px", "--padding-end": "8px"}}>
          <IonItem button onClick={() => setActiveTab("myprofile")} className={activeTab === "myprofile" ? "active-sidebar-item" : ""} color="light">
            <IonIcon icon={personCircleOutline} slot="start" /> 
            <IonLabel>My Profile</IonLabel>
          </IonItem>
        </IonList>
      </IonFooter>

    </IonMenu>
  );
};


// ===================================================================
// 3. StaffDashboard COMPONENT (Main Component)
// ===================================================================
const colorPalette = ["#36a2eb", "#4caf50", "#ff9800", "#f39c12", "#9b59b6", "#e74c3c", "#2ecc71"];

const StaffDashboard: React.FC = () => {
  // Kining data fetching logic, gikuha gikan sa imong original StaffDashboard
  const [activeTab, setActiveTab] = useState("dashboard");
  const [totalEquipment, setTotalEquipment] = useState(0);
  const [todayBookings, setTodayBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [filter, setFilter] = useState<"week" | "month" | "year">("month");
  const [topEquipments, setTopEquipments] = useState<any[]>([]);
  const [loadingEquipments, setLoadingEquipments] = useState(true);
  const [equipmentCountData, setEquipmentCountData] = useState<any[]>([]);
  const [loadingEquipmentCount, setLoadingEquipmentCount] = useState(true);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Kining logic gikan sa imong gi-provide nga StaffDashboard
    const fetchData = async () => {
      try {
        const { count: equipmentCount } = await supabase.from("equipment").select("*", { count: "exact", head: true });
        setTotalEquipment(equipmentCount || 0);
        const today = new Date().toISOString().split("T")[0];
        const { count: todayApprovedCount } = await supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "approved").gte("approved_at", `${today}T00:00:00`).lte("approved_at", `${today}T23:59:59`);
        setTodayBookings(todayApprovedCount || 0);
        const { count: totalBookingsCount } = await supabase.from("bookings").select("*", { count: "exact", head: true });
        setTotalBookings(totalBookingsCount || 0);
        const { data: approvedBookings } = await supabase.from("bookings").select("id").eq("status", "approved");
        const approvedBookingIds = approvedBookings?.map((b) => b.id) || [];
        let revenueSum = 0;
        if (approvedBookingIds.length > 0) {
          const { data: revenueData } = await supabase.from("transactions").select("amount, booking_id").in("booking_id", approvedBookingIds);
          if (revenueData && revenueData.length > 0) {
            revenueSum = revenueData.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
          }
        }
        setTotalRevenue(revenueSum);
        const { count: pendingCount } = await supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending");
        setPendingBookings(pendingCount || 0);
      } catch (error) {
        console.error("Error fetching summary data:", error);
      }
    };
    const fetchAnalytics = async () => {
      try {
        setLoadingAnalytics(true);
        const { data: transactions } = await supabase.from("transactions").select("id, amount, status, paid_at, booking:booking_id(equipment_name)").eq("status", "paid");
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        let filtered = transactions || [];
        if (filter === "year") {
          filtered = filtered.filter((t: any) => new Date(t.paid_at).getFullYear() === currentYear);
        } else if (filter === "month") {
          filtered = filtered.filter((t: any) => { const date = new Date(t.paid_at); return date.getMonth() === currentMonth && date.getFullYear() === currentYear; });
        } else if (filter === "week") {
          const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0, 0, 0, 0);
          const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6); endOfWeek.setHours(23, 59, 59, 999);
          filtered = filtered.filter((t: any) => { const date = new Date(t.paid_at); return date >= startOfWeek && date <= endOfWeek; });
          const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const groupedSales: Record<string, number> = {}; weekDays.forEach((d) => (groupedSales[d] = 0));
          filtered.forEach((t: any) => {
            const dayLabel = new Date(t.paid_at).toLocaleDateString("en-US", { weekday: "short" });
            if (groupedSales.hasOwnProperty(dayLabel)) { groupedSales[dayLabel] += t.amount || 0; }
          });
          const formattedData = weekDays.map((d) => ({ label: d, revenue: groupedSales[d] || 0 }));
          setSalesData(formattedData);
        }
        if (filter !== "week") {
          const groupedSales: Record<string, number> = {};
          filtered.forEach((t: any) => {
            const date = new Date(t.paid_at);
            let label = "";
            if (filter === "year") label = date.toLocaleString("default", { month: "short" });
            else if (filter === "month") label = date.toLocaleDateString("default", { day: "numeric" });
            groupedSales[label] = (groupedSales[label] || 0) + (t.amount || 0);
          });
          setSalesData(Object.entries(groupedSales).map(([label, amount]) => ({ label, revenue: amount })));
        }
        const equipmentMap: Record<string, { revenue: number; count: number }> = {};
        filtered.forEach((t: any) => {
          const name = t.booking?.equipment_name || "Unknown Equipment";
          if (!equipmentMap[name]) equipmentMap[name] = { revenue: 0, count: 0 };
          equipmentMap[name].revenue += t.amount || 0;
          equipmentMap[name].count += 1;
        });
        const top = Object.entries(equipmentMap).map(([name, { revenue }]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
        setTopEquipments(top);
        const countData = Object.entries(equipmentMap).map(([name, { count }]) => ({ label: name, count }));
        setEquipmentCountData(countData);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoadingAnalytics(false); setLoadingEquipments(false); setLoadingEquipmentCount(false);
      }
    };
    const fetchLogs = async () => {
      try {
        setLoadingLogs(true);
        const { data } = await supabase.from("activity_logs").select("*").order("log_id", { ascending: false });
        setActivityLogs(data || []);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error fetching activity logs:", err);
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchData(); fetchAnalytics(); fetchLogs();
    const subscription = supabase.channel("bookings-updates").on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => { fetchData(); fetchAnalytics(); }).subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, [filter]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        const totalPages = Math.ceil(activityLogs.length / 5);
        return (
          <IonGrid className="ion-padding">
            <IonRow>
              <IonCol size="12" sizeMd="3"><IonCard color="primary"><IonCardHeader><IonCardTitle>Total Equipment</IonCardTitle></IonCardHeader><IonCardContent style={{ fontSize: "22px", fontWeight: "bold" }}>{totalEquipment}</IonCardContent></IonCard></IonCol>
              <IonCol size="12" sizeMd="3"><IonCard color="success"><IonCardHeader><IonCardTitle>Today's Bookings</IonCardTitle></IonCardHeader><IonCardContent style={{ fontSize: "22px", fontWeight: "bold" }}>{todayBookings}</IonCardContent></IonCard></IonCol>
              <IonCol size="12" sizeMd="3"><IonCard color="tertiary"><IonCardHeader><IonCardTitle>Pending Bookings</IonCardTitle></IonCardHeader><IonCardContent style={{ fontSize: "22px", fontWeight: "bold" }}>{pendingBookings}</IonCardContent></IonCard></IonCol>
              <IonCol size="12" sizeMd="3"><IonCard color="warning"><IonCardHeader><IonCardTitle>Total Revenue</IonCardTitle></IonCardHeader><IonCardContent style={{ fontSize: "22px", fontWeight: "bold" }}>₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</IonCardContent></IonCard></IonCol>
            </IonRow>
            <IonRow style={{ marginTop: "20px" }}>
              <IonCol size="12" sizeMd="8">
                <IonCard style={{ height: "350px" }}>
                  <IonCardHeader style={{ display: "flex", justifyContent: "space-between", alignItems: "left" }}>
                    <IonCardTitle>Sales Analytics ({filter})</IonCardTitle>
                    <IonItem lines="none" style={{ maxWidth: "150px", marginLeft: "auto", marginRight: 0 }}>
                      <IonLabel>Filter:</IonLabel>
                      <IonSelect value={filter} onIonChange={(e) => setFilter(e.detail.value)} interface="popover">
                        <IonSelectOption value="week">Week</IonSelectOption><IonSelectOption value="month">Month</IonSelectOption><IonSelectOption value="year">Year</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                  </IonCardHeader>
                  <IonCardContent>{loadingAnalytics ? ( <IonSpinner name="dots" /> ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={salesData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip formatter={(value: number) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
                        <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>{salesData.map((entry, index) => (<Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />))}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}</IonCardContent>
                </IonCard>
                <IonCard style={{ height: "350px", marginTop: "20px" }}>
                  <IonCardHeader><IonCardTitle>Equipment Analytics (Total Bookings)</IonCardTitle></IonCardHeader>
                  <IonCardContent>{loadingEquipmentCount ? ( <IonSpinner name="dots" /> ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={equipmentCountData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip />
                        <Bar dataKey="count" radius={[8, 8, 0, 0]}>{equipmentCountData.map((entry, index) => (<Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />))}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}</IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="12" sizeMd="4">
                <IonCard style={{ height: "230px" }}>
                  <IonCardHeader><IonCardTitle>Top Equipment ({filter})</IonCardTitle></IonCardHeader>
                  <IonCardContent>{loadingEquipments ? ( <IonSpinner name="dots" /> ) : topEquipments.length > 0 ? (
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={topEquipments} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={35} label>
                          {topEquipments.map((entry, index) => (<Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : ( <p>No equipment data available for this {filter}.</p> )}
                  </IonCardContent>
                </IonCard>
                <IonCard style={{ height: "470px", marginTop: "20px" }}>
                  <IonCardHeader><IonCardTitle>Activity Logs</IonCardTitle></IonCardHeader>
                  <IonCardContent style={{ overflowY: "auto" }}>{loadingLogs ? ( <IonSpinner name="dots" /> ) : activityLogs.length > 0 ? (
                    <>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                        <thead><tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}><th style={{ padding: "6px" }}>#</th><th style={{ padding: "6px" }}>Name</th><th style={{ padding: "6px" }}>Role</th><th style={{ padding: "6px" }}>Login</th><th style={{ padding: "6px" }}>Logout</th></tr></thead>
                        <tbody>
                          {activityLogs.slice((currentPage - 1) * 5, currentPage * 5).map((log, index) => (
                            <tr key={log.log_id} style={{ borderBottom: "1px solid #eee" }}>
                              <td style={{ padding: "6px" }}>{(currentPage - 1) * 5 + index + 1}</td><td style={{ padding: "6px" }}>{log.name}</td><td style={{ padding: "6px" }}>{log.role}</td>
                              <td style={{ padding: "6px" }}>{log.date_in ? new Date(log.date_in).toLocaleString() : "-"}</td>
                              <td style={{ padding: "6px" }}>{log.date_out ? new Date(log.date_out).toLocaleString() : "— Active"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                        <IonButton size="small" fill="outline" color="warning" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>&lt;</IonButton>
                        <span>Page {currentPage} of {totalPages}</span>
                        <IonButton size="small" fill="outline" color="warning" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>&gt;</IonButton>
                      </div>
                    </>
                  ) : ( <p>No activity logs available.</p> )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        );
      
      // Gi-update ang cases base sa imports sa StaffDashboard
      case "generatereports": return <GenerateReports />;
      case "users": return <Staff_UsersTab />;
      case "equipmentlist": return <EquipmentList />;
      case "viewbookingcalendar": return <ViewBookingCalendar />;
      case "managerentalbookings": return <ManageRentalBookings />;
      case "viewalltransactions": return <ViewAllTransactions />;
      case "myprofile": return <Staff_MyProfile />;
      default: return null;
    }
  };

  return (
    // ✅✅✅ KINI ANG BAG-O NGA "OVERLAY" LAYOUT (gikopya sa Admin) ✅✅✅
    <> 
      {/* Ang CSS component */}
      <DashboardStyles />
      
      {/* Ang Sidebar (tago by default, ug type="overlay") */}
      <Staff_StaffSidebar 
        setActiveTab={setActiveTab} 
        activeTab={activeTab} 
      />
      
      {/* Ang Page (nga maoy makita) */}
      <IonPage id="main-dashboard-content">
        <Staff_StaffHeaderBar />
        <IonContent scrollY={true} color="light">
          {renderContent()}
        </IonContent>
      </IonPage>
      
    </>
  );
};

export default StaffDashboard;