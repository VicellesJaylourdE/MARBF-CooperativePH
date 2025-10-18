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
  const [bookingData, setBookingData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    pending: 0,
    approved: 0,
    completed: 0,
  });
  const [filter, setFilter] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        const { data: bookings, error } = await supabase
          .from("bookings")
          .select("id, status, total_price, start_date");

        if (error) throw error;
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());

        const filtered = bookings.filter((b: any) => {
          const date = new Date(b.start_date);
          if (filter === "year") return date.getFullYear() === currentYear;
          if (filter === "month")
            return (
              date.getMonth() === currentMonth &&
              date.getFullYear() === currentYear
            );
          if (filter === "week") return date >= startOfWeek;
          return true;
        });

        const groupedStats: Record<string, number> = {};
        let totalRevenue = 0;
        let pending = 0;
        let approved = 0;
        let completed = 0;

        filtered.forEach((b: any) => {
          const date = new Date(b.start_date);
          let label = "";

          if (filter === "year") {
            label = date.toLocaleString("default", { month: "short" });
          } else if (filter === "month") {
            label = date.toLocaleDateString("default", {
              day: "numeric",
            });
          } else {
            label = date.toLocaleDateString("default", {
              weekday: "short",
            });
          }

          groupedStats[label] = (groupedStats[label] || 0) + 1;
          totalRevenue += b.total_price || 0;

          if (b.status === "pending") pending++;
          if (b.status === "approved") approved++;
          if (b.status === "completed") completed++;
        });

        const formattedData = Object.entries(groupedStats).map(
          ([label, count]) => ({
            label,
            bookings: count,
          })
        );

        setBookingData(formattedData);
        setSummary({
          totalBookings: filtered.length,
          totalRevenue,
          pending,
          approved,
          completed,
        });
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [filter]);

  return (
    <IonContent className="ion-padding">
      {/* ✅ Original header (untouched) */}
      <h2>Late Return Penalty</h2>
      <p>View monthly revenue details.</p>

      {/* ✅ Analytics Filter */}
      <IonItem lines="none" className="ion-margin-bottom">
        <IonLabel>Filter by:</IonLabel>
        <IonSelect
          value={filter}
          onIonChange={(e) => setFilter(e.detail.value)}
        >
          <IonSelectOption value="week">This Week</IonSelectOption>
          <IonSelectOption value="month">This Month</IonSelectOption>
          <IonSelectOption value="year">This Year</IonSelectOption>
        </IonSelect>
      </IonItem>

      {/* ✅ Analytics Card */}
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>📊 Booking Analytics ({filter})</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {loading ? (
            <IonSpinner name="dots" />
          ) : (
            <>
              {/* ✅ Summary */}
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
                  <strong>Total Bookings:</strong> {summary.totalBookings}
                </div>
                <div>
                  <strong>Total Revenue:</strong> ₱
                  {summary.totalRevenue.toFixed(2)}
                </div>
                <div>
                  <strong>Pending:</strong> {summary.pending}
                </div>
                <div>
                  <strong>Approved:</strong> {summary.approved}
                </div>
                <div>
                  <strong>Completed:</strong> {summary.completed}
                </div>
              </div>

              {/* ✅ Chart */}
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={bookingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#3880ff" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </IonCardContent>
      </IonCard>
    </IonContent>
  );
};

export default Admin_AdminDashboardAnaltys;
