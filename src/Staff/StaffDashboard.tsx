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
  IonButton
} from "@ionic/react";
import StaffHeaderBar from "../components/Staff_StaffHeaderBar";
import StaffSidebar from "../components/Staff_StaffSidebar";
import { supabase } from "../utils/supabaseClient";

import GenerateReports from "../components/Staff_GenerateReports ";
import Staff_UsersTab from "../components/Staff_UsersTab";
import ViewBookingCalendar from "../components/Staff_ViewBookingCalendar";
import ViewAllTransactions from "./Staff_ViewAllTransactions";
import ManageRentalBookings from "./ManageRentalBookings";
import EquipmentList from "../components/Staff_EquipmentList";
import Staff_MyProfile from "../components/Staff_MyProfile"

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

const colorPalette = ["#36a2eb", "#4caf50", "#ff9800", "#f39c12", "#9b59b6", "#e74c3c", "#2ecc71"];

const StaffDashboard: React.FC = () => {
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
    const fetchData = async () => {
      try {
        const { count: equipmentCount } = await supabase
          .from("equipment")
          .select("*", { count: "exact", head: true });
        setTotalEquipment(equipmentCount || 0);

        const today = new Date().toISOString().split("T")[0];
        const { count: todayApprovedCount } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved")
          .gte("approved_at", `${today}T00:00:00`)
          .lte("approved_at", `${today}T23:59:59`);
        setTodayBookings(todayApprovedCount || 0);

        const { count: totalBookingsCount } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true });
        setTotalBookings(totalBookingsCount || 0);

        const { data: approvedBookings } = await supabase
          .from("bookings")
          .select("id")
          .eq("status", "approved");

        const approvedBookingIds = approvedBookings?.map((b) => b.id) || [];
        let revenueSum = 0;
        if (approvedBookingIds.length > 0) {
          const { data: revenueData } = await supabase
            .from("transactions")
            .select("amount, booking_id")
            .in("booking_id", approvedBookingIds);
          if (revenueData && revenueData.length > 0) {
            revenueSum = revenueData.reduce(
              (acc, cur) => acc + Number(cur.amount || 0),
              0
            );
          }
        }
        setTotalRevenue(revenueSum);

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

        const { data: transactions } = await supabase
          .from("transactions")
          .select("id, amount, status, paid_at, booking:booking_id(equipment_name)")
          .eq("status", "paid");

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        let filtered = transactions || [];

        if (filter === "year") {
          filtered = filtered.filter((t: any) => {
            const date = new Date(t.paid_at);
            return date.getFullYear() === currentYear;
          });
        } else if (filter === "month") {
          filtered = filtered.filter((t: any) => {
            const date = new Date(t.paid_at);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
          });
        } else if (filter === "week") {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          endOfWeek.setHours(23, 59, 59, 999);

          filtered = filtered.filter((t: any) => {
            const date = new Date(t.paid_at);
            return date >= startOfWeek && date <= endOfWeek;
          });

          const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const groupedSales: Record<string, number> = {};
          weekDays.forEach((d) => (groupedSales[d] = 0));

          filtered.forEach((t: any) => {
            const dayLabel = new Date(t.paid_at).toLocaleDateString("en-US", {
              weekday: "short",
            });
            if (groupedSales.hasOwnProperty(dayLabel)) {
              groupedSales[dayLabel] += t.amount || 0;
            }
          });

          const formattedData = weekDays.map((d) => ({
            label: d,
            revenue: groupedSales[d] || 0,
          }));

          setSalesData(formattedData);
        }

        if (filter !== "week") {
          const groupedSales: Record<string, number> = {};
          filtered.forEach((t: any) => {
            const date = new Date(t.paid_at);
            let label = "";
            if (filter === "year")
              label = date.toLocaleString("default", { month: "short" });
            else if (filter === "month")
              label = date.toLocaleDateString("default", { day: "numeric" });
            groupedSales[label] = (groupedSales[label] || 0) + (t.amount || 0);
          });
          setSalesData(
            Object.entries(groupedSales).map(([label, amount]) => ({
              label,
              revenue: amount,
            }))
          );
        }

        const equipmentMap: Record<string, { revenue: number; count: number }> = {};
        filtered.forEach((t: any) => {
          const name = t.booking?.equipment_name || "Unknown Equipment";
          if (!equipmentMap[name]) equipmentMap[name] = { revenue: 0, count: 0 };
          equipmentMap[name].revenue += t.amount || 0;
          equipmentMap[name].count += 1;
        });

        const top = Object.entries(equipmentMap)
          .map(([name, { revenue }]) => ({ name, revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        setTopEquipments(top);

        const countData = Object.entries(equipmentMap).map(([name, { count }]) => ({
          label: name,
          count,
        }));
        setEquipmentCountData(countData);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoadingAnalytics(false);
        setLoadingEquipments(false);
        setLoadingEquipmentCount(false);
      }
    };

    const fetchLogs = async () => {
      try {
        setLoadingLogs(true);
        const { data } = await supabase
          .from("activity_logs")
          .select("*")
          .order("log_id", { ascending: false });
        setActivityLogs(data || []);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error fetching activity logs:", err);
      } finally {
        setLoadingLogs(false);
      }
    };

    fetchData();
    fetchAnalytics();
    fetchLogs();

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
        const totalPages = Math.ceil(activityLogs.length / 5);
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
                <IonCard style={{ height: "350px" }}>
                  <IonCardHeader style={{ display: "flex", justifyContent: "space-between", alignItems: "left" }}>
                    <IonCardTitle>Sales Analytics ({filter})</IonCardTitle>
                    <IonItem lines="none" style={{ maxWidth: "150px", marginLeft: "auto", marginRight: 0 }}>
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
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={salesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
                          <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                            {salesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </IonCardContent>
                </IonCard>

                <IonCard style={{ height: "350px", marginTop: "20px" }}>
                  <IonCardHeader>
                    <IonCardTitle>Equipment Analytics (Total Bookings)</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {loadingEquipmentCount ? (
                      <IonSpinner name="dots" />
                    ) : (
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={equipmentCountData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="label" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {equipmentCountData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="4">
                <IonCard style={{ height: "230px" }}>
                  <IonCardHeader>
                    <IonCardTitle>Top Equipment ({filter})</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {loadingEquipments ? (
                      <IonSpinner name="dots" />
                    ) : topEquipments.length > 0 ? (
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie
                            data={topEquipments}
                            dataKey="revenue"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={60}
                            innerRadius={35}
                            label
                          >
                            {topEquipments.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colorPalette[index % colorPalette.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => `₱${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p>No equipment data available for this {filter}.</p>
                    )}
                  </IonCardContent>
                </IonCard>

                <IonCard style={{ height: "470px", marginTop: "20px" }}>
                  <IonCardHeader>
                    <IonCardTitle>Activity Logs</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent style={{ overflowY: "auto" }}>
                    {loadingLogs ? (
                      <IonSpinner name="dots" />
                    ) : activityLogs.length > 0 ? (
                      <>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                          <thead>
                            <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                              <th style={{ padding: "6px" }}>#</th>
                              <th style={{ padding: "6px" }}>Name</th>
                              <th style={{ padding: "6px" }}>Role</th>
                              <th style={{ padding: "6px" }}>Login</th>
                              <th style={{ padding: "6px" }}>Logout</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activityLogs
                              .slice((currentPage - 1) * 5, currentPage * 5)
                              .map((log, index) => (
                                <tr key={log.log_id} style={{ borderBottom: "1px solid #eee" }}>
                                  <td style={{ padding: "6px" }}>{(currentPage - 1) * 5 + index + 1}</td>
                                  <td style={{ padding: "6px" }}>{log.name}</td>
                                  <td style={{ padding: "6px" }}>{log.role}</td>
                                  <td style={{ padding: "6px" }}>{log.date_in ? new Date(log.date_in).toLocaleString() : "-"}</td>
                                  <td style={{ padding: "6px" }}>{log.date_out ? new Date(log.date_out).toLocaleString() : "— Active"}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>

                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                          <IonButton
                            size="small"
                            fill="outline"
                            color="warning"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                          >
                            &lt;
                          </IonButton>
                          <span>Page {currentPage} of {totalPages}</span>
                          <IonButton
                            size="small"
                            fill="outline"
                            color="warning"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                          >
                            &gt;
                          </IonButton>
                        </div>
                      </>
                    ) : (
                      <p>No activity logs available.</p>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        );
  
      case "users":
        return <Staff_UsersTab />;
      case "viewbookingcalendar":
        return <ViewBookingCalendar/>;
      case "managerentalbookings":
        return <ManageRentalBookings />;
      case "viewalltransactions":
        return <ViewAllTransactions/>;
         case "generatereports":
        return <GenerateReports/>;
        case "equipmentlist":
        return <EquipmentList/>;
        case "myprofile":
        return <Staff_MyProfile/>;
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

export default StaffDashboard;
