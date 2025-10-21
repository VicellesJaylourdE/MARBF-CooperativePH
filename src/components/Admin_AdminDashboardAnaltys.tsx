import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Admin_AdminDashboardAnaltys: React.FC = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState({
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [filter, setFilter] = useState<"week" | "month" | "year">("month");

  const [topEquipments, setTopEquipments] = useState<any[]>([]);
  const [loadingEquipments, setLoadingEquipments] = useState<boolean>(true);

  const [totalEquipment, setTotalEquipment] = useState(0);
  const [todayBookings, setTodayBookings] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchSummary = async () => {
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

        const { count: usersCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });
        setTotalUsers(usersCount || 0);
      } catch (error) {
        console.error("Error fetching summary:", error);
      }
    };

    fetchSummary();
  }, []);

  // 🔹 Fetch analytics + top equipment (existing code)
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

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

        let totalRevenue = 0;
        const groupedSales: Record<string, number> = {};

        filtered.forEach((t: any) => {
          const date = new Date(t.paid_at);
          let label = "";

          if (filter === "year") {
            label = date.toLocaleString("default", { month: "short" });
          } else if (filter === "month") {
            label = date.toLocaleDateString("default", { day: "numeric" });
          } else {
            label = date.toLocaleDateString("default", { weekday: "short" });
          }

          groupedSales[label] = (groupedSales[label] || 0) + (t.amount || 0);
          totalRevenue += t.amount || 0;
        });

        const formattedData = Object.entries(groupedSales).map(([label, amount]) => ({
          label,
          revenue: amount,
        }));

        setSalesData(formattedData);
        setSummary({
          totalBookings: filtered.length,
          totalRevenue,
        });
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchTopEquipments = async () => {
      try {
        setLoadingEquipments(true);

        const { data: transactions, error } = await supabase
          .from("transactions")
          .select("amount, status, paid_at, booking:booking_id(equipment_name)");

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

        const revenuePerEquipment: Record<string, number> = {};
        filtered.forEach((t: any) => {
          const equipmentName = t.booking?.equipment_name || "Unknown Equipment";
          revenuePerEquipment[equipmentName] =
            (revenuePerEquipment[equipmentName] || 0) + (t.amount || 0);
        });

        const top = Object.entries(revenuePerEquipment)
          .map(([name, revenue]) => ({ name, revenue }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        setTopEquipments(top);
      } catch (err) {
        console.error("Error fetching top equipment:", err);
      } finally {
        setLoadingEquipments(false);
      }
    };

    fetchAnalytics();
    fetchTopEquipments();
  }, [filter]);

  return (
    <IonContent className="ion-padding">
      {/* ✅ Copied Dashboard Summary Cards */}
      <IonGrid>
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
                <IonCardTitle>Total Users</IonCardTitle>
              </IonCardHeader>
              <IonCardContent style={{ fontSize: "22px", fontWeight: "bold" }}>
                {totalUsers}
              </IonCardContent>
            </IonCard>
          </IonCol>

          <IonCol size="12" sizeMd="3">
            <IonCard color="warning">
              <IonCardHeader>
                <IonCardTitle>Total Revenue</IonCardTitle>
              </IonCardHeader>
              <IonCardContent style={{ fontSize: "22px", fontWeight: "bold" }}>
                ₱{summary.totalRevenue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>

      {/* 🔸 Existing Analytics Section */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        <div style={{ flex: "1 1 65%", minWidth: "320px" }}>
          <IonCard>
            <IonCardHeader
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <IonCardTitle>💰 Sales Analytics ({filter})</IonCardTitle>
              <IonItem
                lines="none"
                style={{ maxWidth: "200px", marginLeft: "auto", marginRight: 0 }}
              >
                <IonLabel>Filter:</IonLabel>
                <IonSelect
                  value={filter}
                  onIonChange={(e) => setFilter(e.detail.value)}
                  interface="popover"
                >
                  <IonSelectOption value="week">Week</IonSelectOption>
                  <IonSelectOption value="month">Month</IonSelectOption>
                  <IonSelectOption value="year">Year</IonSelectOption>
                </IonSelect>
              </IonItem>
            </IonCardHeader>

            <IonCardContent>
              {loading ? (
                <IonSpinner name="dots" />
              ) : (
                <>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-around",
                      flexWrap: "wrap",
                      marginBottom: "1rem",
                      textAlign: "center",
                    }}
                  >
                    <div>
                      <strong>Total Sales:</strong> ₱
                      {summary.totalRevenue.toFixed(2)}
                    </div>
                    <div>
                      <strong>Total Bookings:</strong> {summary.totalBookings}
                    </div>
                  </div>

                  <div style={{ width: "100%", height: 320 }}>
                    <ResponsiveContainer>
                      <BarChart data={salesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) =>
                            `₱${value.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                            })}`
                          }
                        />
                        <Bar
                          dataKey="revenue"
                          fill={
                            filter === "week"
                              ? "#36a2eb"
                              : filter === "month"
                              ? "#4caf50"
                              : "#ff9800"
                          }
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </IonCardContent>
          </IonCard>
        </div>

        <div style={{ flex: "1 1 30%", minWidth: "300px" }}>
          <IonCard>
            <IonCardHeader
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <IonCardTitle>🏆 Top Equipment ({filter})</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              {loadingEquipments ? (
                <IonSpinner name="dots" />
              ) : topEquipments.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {topEquipments.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        backgroundColor: "#1e1e1e",
                        padding: "10px 15px",
                        borderRadius: "8px",
                        color: "white",
                        fontSize: "15px",
                      }}
                    >
                      <span>{item.name}</span>
                      <span>
                        ₱
                        {item.revenue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No equipment data available for this {filter}.</p>
              )}
            </IonCardContent>
          </IonCard>
        </div>
      </div>
    </IonContent>
  );
};

export default Admin_AdminDashboardAnaltys;
