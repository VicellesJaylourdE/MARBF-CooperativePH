import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonBadge,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

interface InventoryLog {
  log_id: number;
  equipment_id: string;
  equipment_name?: string;
  user_id: number;
  username?: string;
  reference_booking?: string;
  action: "add_stock" | "reserve" | "return";
  quantity_change: number;
  created_at: string;
}

const Admin_InventoryLogs: React.FC = () => {
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Async wrapper for fetchLogs
    const fetchData = async () => {
      await fetchLogs();
    };
    fetchData();

    // Realtime subscription
    const channel = supabase
      .channel("inventory-logs-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "inventory_logs" },
        () => fetchLogs()
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("inventory_logs")
        .select(`
          log_id,
          equipment_id,
          equipment:equipment_id(name),
          user_id,
          user:users(user_firstname, user_lastname, username),
          reference_booking,
          action,
          quantity_change,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = data?.map((log: any) => ({
        log_id: log.log_id,
        equipment_id: log.equipment_id,
        equipment_name: log.equipment?.name || "Unknown",
        user_id: log.user_id,
        username:
          log.user?.username ||
          `${log.user?.user_firstname || ""} ${log.user?.user_lastname || ""}`.trim() ||
          "Unknown User",
        reference_booking: log.reference_booking,
        action: log.action,
        quantity_change: log.quantity_change,
        created_at: log.created_at,
      })) as InventoryLog[];

      setLogs(mapped || []);
    } catch (err: any) {
      console.error("Error fetching inventory logs:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "add_stock":
        return "#28a745";
      case "reserve":
        return "#fd7e14";
      case "return":
        return "#17a2b8";
      default:
        return "#6c757d";
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Inventory Logs</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
          </div>
        ) : logs.length === 0 ? (
          <p>No inventory logs found.</p>
        ) : (
          logs.map((log) => (
            <IonCard key={log.log_id}>
              <IonCardContent>
                <strong>Equipment:</strong> {log.equipment_name} <br />
                <strong>User:</strong> {log.username} <br />
                {log.reference_booking && (
                  <>
                    <strong>Booking Ref:</strong> {log.reference_booking} <br />
                  </>
                )}
                <strong>Action:</strong>{" "}
                <IonBadge
                  style={{
                    backgroundColor: getActionColor(log.action),
                    color: "#fff",
                    fontWeight: 600,
                    padding: "0.3em 0.6em",
                    borderRadius: "12px",
                  }}
                >
                  {log.action.toUpperCase()}
                </IonBadge>{" "}
                <strong>Qty:</strong> {log.quantity_change} <br />
                <strong>Date:</strong> {new Date(log.created_at).toLocaleString()}
              </IonCardContent>
            </IonCard>
          ))
        )}
      </IonContent>
    </IonPage>
  );
};

export default Admin_InventoryLogs;
