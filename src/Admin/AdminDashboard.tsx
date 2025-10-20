import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonSplitPane,
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
} from "@ionic/react";
import StaffHeaderBar from "../components/Admin_AdminHeaderBar";
import StaffSidebar from "../components/Admin_AdminSidebar";
import { supabase } from "../utils/supabaseClient";

import Admin_UsersTab from "../components/Admin_UsersTab";
import Admin_GenerateReports from "../components/Admin_GenerateReports";
import Staff_BookingsTab from "../components/Staff_BookingsTab";
import Admin_Manageequipment from "../components/Admin_Manageequipment";
import Admin_ViewBookingCalendar from "../components/Admin_ViewBookingCalendar";
import Admin_ManageRentalBookings from "../components/Admin_ManageRentalBookings";
import Admin_ViewAllTransactions from "../components/Admin_ViewAllTransactions";
import Admin_ManageUsers from "../components/Admin_ManageUsers";
import Admin_LateReturnPenalty from "../components/Admin_LateReturnPenalty";
import Admin_RegisterMember from "../components/Admin_RegisterMember";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Admin_AdminDashboardAnaltys from "../components/Admin_AdminDashboardAnaltys";

const AdminDashboard: React.FC = () => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Total Equipment
        const { count: equipmentCount } = await supabase
          .from("equipment")
          .select("*", { count: "exact", head: true });
        setTotalEquipment(equipmentCount || 0);

        // Today's Bookings
        const today = new Date().toISOString().split("T")[0];
        const { count: todayApprovedCount, error: todayApprovedError } =
          await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("status", "approved")
            .gte("approved_at", `${today}T00:00:00`)
            .lte("approved_at", `${today}T23:59:59`);
        if (todayApprovedError) throw todayApprovedError;
        setTodayBookings(todayApprovedCount || 0);

        // Total Bookings
        const { count: totalBookingsCount, error: totalBookingsError } =
          await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true });
        if (totalBookingsError) throw totalBookingsError;
        setTotalBookings(totalBookingsCount || 0);

        // Total Revenue
        const { data: approvedBookings, error: bookingsError } = await supabase
          .from("bookings")
          .select("id")
          .eq("status", "approved");
        if (bookingsError) throw bookingsError;

        const approvedBookingIds = approvedBookings?.map((b) => b.id) || [];
        let revenueSum = 0;
        if (approvedBookingIds.length > 0) {
          const { data: revenueData, error: revenueError } = await supabase
            .from("transactions")
            .select("amount, booking_id")
            .in("booking_id", approvedBookingIds);
          if (revenueError) throw revenueError;
          if (revenueData && revenueData.length > 0) {
            revenueSum = revenueData.reduce(
              (acc, cur) => acc + Number(cur.amount || 0),
              0
            );
          }
        }
        setTotalRevenue(revenueSum);

        // Pending Bookings
        const { count: pendingCount } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");
        setPendingBookings(pendingCount || 0);
      } catch (error) {
        console.error("Error fetching summary data:", error);
      }
    };

    const fetchAnalytics = async () => {
      try {
        setLoadingAnalytics(true);
        const { data: transactions, error } = await supabase
          .from("transactions")
          .select("id, amount, status, paid_at, booking:booking_id(equipment_name)");

        if (error) throw error;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());

        const filtered = transactions.filter((t: any) => {
          if (t.status !== "paid") return false;
          const date = new Date(t.paid_at);
          if (filter === "year") return date.getFullYear() === currentYear;
          if (filter === "month")
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          if (filter === "week") return date >= startOfWeek;
          return true;
        });

        const groupedSales: Record<string, number> = {};
        filtered.forEach((t: any) => {
          const date = new Date(t.paid_at);
          let label = "";
          if (filter === "year") label = date.toLocaleString("default", { month: "short" });
          else if (filter === "month") label = date.toLocaleDateString("default", { day: "numeric" });
          else label = date.toLocaleDateString("default", { weekday: "short" });
          groupedSales[label] = (groupedSales[label] || 0) + (t.amount || 0);
        });

        const formattedData = Object.entries(groupedSales).map(([label, amount]) => ({
          label,
          revenue: amount,
        }));
        setSalesData(formattedData);

        // Top Equipments
        const revenuePerEquipment: Record<string, number> = {};
        filtered.forEach((t: any) => {
          const equipmentName = t.booking?.equipment_name || "Unknown Equipment";
          revenuePerEquipment[equipmentName] = (revenuePerEquipment[equipmentName] || 0) + (t.amount || 0);
        });

        const top = Object.entries(revenuePerEquipment)
          .map(([name, revenue]) => ({ name, revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setTopEquipments(top);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoadingAnalytics(false);
        setLoadingEquipments(false);
      }
    };

    fetchData();
    fetchAnalytics();

    const subscription = supabase
      .channel("bookings-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        fetchData();
        fetchAnalytics();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [filter]);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <IonGrid className="ion-padding">
            <IonRow>
              <IonCol size="12" sizeMd="3">
                <IonCard color="primary">
                  <IonCardHeader>
                    <IonCardTitle>Total Equipment</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent style={{ fontSize: "22px", fontWeight: "bold" }}>
                    {totalEquipment}
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="3">
                <IonCard color="success">
                  <IonCardHeader>
                    <IonCardTitle>Today's Bookings</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent style={{ fontSize: "22px", fontWeight: "bold" }}>
                    {todayBookings}
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="3">
                <IonCard color="tertiary">
                  <IonCardHeader>
                    <IonCardTitle>Pending Bookings</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent style={{ fontSize: "22px", fontWeight: "bold" }}>
                    {pendingBookings}
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="3">
                <IonCard color="warning">
                  <IonCardHeader>
                    <IonCardTitle>Total Revenue</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent style={{ fontSize: "22px", fontWeight: "bold" }}>
                    ₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

            <IonRow style={{ marginTop: "20px" }}>
              <IonCol size="12" sizeMd="8">
                <IonCard>
                  <IonCardHeader style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <IonCardTitle>💰 Sales Analytics ({filter})</IonCardTitle>
                    <IonItem lines="none" style={{ maxWidth: "200px", marginLeft: "auto", marginRight: 0 }}>
                      <IonLabel>Filter:</IonLabel>
                      <IonSelect value={filter} onIonChange={(e) => setFilter(e.detail.value)} interface="popover">
                        <IonSelectOption value="week">Week</IonSelectOption>
                        <IonSelectOption value="month">Month</IonSelectOption>
                        <IonSelectOption value="year">Year</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                  </IonCardHeader>
                  <IonCardContent>
                    {loadingAnalytics ? (
                      <IonSpinner name="dots" />
                    ) : (
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={salesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
                          <Bar
                            dataKey="revenue"
                            fill={filter === "week" ? "#36a2eb" : filter === "month" ? "#4caf50" : "#ff9800"}
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="4">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>🏆 Top Equipment ({filter})</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {loadingEquipments ? (
                      <IonSpinner name="dots" />
                    ) : topEquipments.length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {topEquipments.map((item, index) => (
                          <div key={index} style={{ display: "flex", justifyContent: "space-between", backgroundColor: "#1e1e1e", padding: "10px 15px", borderRadius: "8px", color: "white", fontSize: "15px" }}>
                            <span>{item.name}</span>
                            <span>₱{item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No equipment data available for this {filter}.</p>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        );

      case "users":
        return <Admin_UsersTab />;
      case "generatereports":
        return <Admin_GenerateReports />;
      case "bookings":
        return <Staff_BookingsTab />;
      case "manageequipment":
        return <Admin_Manageequipment />;
      case "viewcbookingcalendar":
        return <Admin_ViewBookingCalendar />;
      case "managerentalbookings":
        return <Admin_ManageRentalBookings />;
      case "viewalltransactions":
        return <Admin_ViewAllTransactions />;
      case "manageusers":
        return <Admin_ManageUsers />;
      case "latereturnpenalty":
        return <Admin_LateReturnPenalty />;
      case "registermember":
        return <Admin_RegisterMember />;
      case "admindashboardanaltys":
        return <Admin_AdminDashboardAnaltys />;
      default:
        return null;
    }
  };

  return (
    <IonSplitPane contentId="staff-main" when={false}>
      <StaffSidebar setActiveTab={setActiveTab} />
      <IonPage id="staff-main">
        <StaffHeaderBar />
        <IonContent scrollY={true}>{renderContent()}</IonContent>
      </IonPage>
    </IonSplitPane>
  );
};

export default AdminDashboard;
