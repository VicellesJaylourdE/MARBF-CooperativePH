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

interface ReportData {
  id?: string;
  user_id?: number;
  equipment_name?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  name?: string;
  amount?: number;
  payment_method?: string;
  created_at?: string;
  category?: string;
  price?: number;
  user_name?: string;
}

const Admin_GenerateReports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<string>("bookings");
  const [data, setData] = useState<ReportData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let fetchedData: ReportData[] | null = [];
        let error: any = null;

        if (reportType === "bookings") {
          const res = await supabase
            .from("bookings")
            .select("id, user_id, equipment_name, start_date, end_date, status");
          fetchedData = res.data;
          error = res.error;
        } else if (reportType === "transactions") {
          const res = await supabase
            .from("transactions")
            .select("id, user_id, amount, status, payment_method, created_at");
          fetchedData = res.data;
          error = res.error;
        } else if (reportType === "equipment") {
          const res = await supabase
            .from("equipment")
            .select("name, category, price, status");
          fetchedData = res.data;
          error = res.error;
        }

        if (error) throw error;

        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("user_id, username, user_firstname, user_lastname");

        if (usersError) throw usersError;

        const merged = fetchedData?.map((item) => {
          if (!item.user_id) return item;
          const user = usersData?.find((u) => u.user_id === item.user_id);
          return {
            ...item,
            user_name: user
              ? user.username ||
                `${user.user_firstname || ""} ${user.user_lastname || ""}`.trim()
              : "Unknown User",
          };
        });

        setData(merged || []);
      } catch (err: any) {
        console.error("Error fetching report:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reportType]);

  return (
    <IonContent
      className="ion-padding"
      style={{
        "--background": "#000",
        color: "#fff",
        minHeight: "100vh",
      } as React.CSSProperties}
    >
      <h2 style={{ color: "#fff", fontSize: "1.6rem", marginBottom: "6px" }}>
        Reports
      </h2>
      <p style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: "16px" }}>
        Generate rental and financial summaries.
      </p>

      <IonItem
        style={{
          "--background": "#111",
          borderRadius: "12px",
          marginBottom: "16px",
          padding: "6px 10px",
        }}
      >
        <IonLabel>Select Report Type</IonLabel>
        <IonSelect
          value={reportType}
          onIonChange={(e) => setReportType(e.detail.value)}
          style={{ color: "#fff" }}
        >
          <IonSelectOption value="bookings">Bookings Report</IonSelectOption>
          <IonSelectOption value="transactions">
            Transactions Report
          </IonSelectOption>
          <IonSelectOption value="equipment">Equipment Report</IonSelectOption>
        </IonSelect>
      </IonItem>

      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "30px",
          }}
        >
          <IonSpinner name="crescent" />
        </div>
      ) : (
        <div style={{ marginTop: "20px" }}>
          {data.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "#666",
                marginTop: "20px",
              }}
            >
              No data found.
            </p>
          ) : (
            data.map((item, index) => (
              <IonCard
                key={index}
                style={{
                  background: "#111",
                  borderRadius: "14px",
                  boxShadow: "0 0 10px rgba(255, 255, 255, 0.05)",
                  marginBottom: "14px",
                }}
              >
                <IonCardHeader>
                  <IonCardTitle style={{ color: "#fff" }}>
                    {index + 1}. {item.equipment_name || item.name || item.user_name || `#${item.id}`}
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 2fr",
                      rowGap: "6px",
                      columnGap: "10px",
                    }}
                  >
                    {Object.entries(item).map(([key, value]) => (
                      <React.Fragment key={key}>
                        <div
                          style={{
                            color: "#aaa",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          {key.replaceAll("_", " ")}
                        </div>
                        <div style={{ color: "#ccc", fontSize: "0.9rem" }}>
                          {String(value)}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </IonCardContent>
              </IonCard>
            ))
          )}
        </div>
      )}
    </IonContent>
  );
};

export default Admin_GenerateReports;
