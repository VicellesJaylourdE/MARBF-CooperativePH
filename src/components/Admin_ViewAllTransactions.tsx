import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonToast,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

interface Transaction {
  id: string;
  booking_id: string | null;
  user_id: string | null;
  amount: number;
  status: string;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
}

const Admin_ViewAllTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Remove duplicates based on booking_id + user_id, keep latest
      const uniqueMap = new Map<string, Transaction>();
      data?.forEach((t) => {
        const key = `${t.booking_id}-${t.user_id}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, t);
        }
      });

      setTransactions(Array.from(uniqueMap.values()));
    } catch (err: any) {
      console.error(err);
      setErrorToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h2 style={{ fontWeight: "bold", fontSize: "1.3rem" }}>
          View All Transactions
        </h2>
        <p>List of all transactions.</p>

        {loading ? (
          <div className="ion-text-center" style={{ marginTop: "30px" }}>
            <IonSpinner name="crescent" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="ion-text-center">No transactions found.</p>
        ) : (
          <IonGrid>
            <IonRow
              style={{
                fontWeight: "bold",
                background: "#030303ff",
                padding: "8px 0",
                fontSize: "0.9rem",
              }}
            >
              <IonCol>ID</IonCol>
              <IonCol>Booking ID</IonCol>
              <IonCol>User ID</IonCol>
              <IonCol>Amount</IonCol>
              <IonCol>Status</IonCol>
              <IonCol>Payment Method</IonCol>
              <IonCol>Paid At</IonCol>
              <IonCol>Created At</IonCol>
            </IonRow>

            {transactions.map((t) => (
              <IonRow
                key={t.id}
                style={{
                  borderBottom: "1px solid #040404ff",
                  padding: "6px 0",
                  fontSize: "0.85rem",
                }}
              >
                <IonCol>{t.id}</IonCol>
                <IonCol>{t.booking_id || "-"}</IonCol>
                <IonCol>{t.user_id || "-"}</IonCol>
                <IonCol>₱{Number(t.amount).toFixed(2)}</IonCol>
                <IonCol
                  style={{
                    color:
                      t.status === "paid"
                        ? "green"
                        : t.status === "cancelled"
                        ? "red"
                        : "#555",
                  }}
                >
                  {t.status}
                </IonCol>
                <IonCol>{t.payment_method || "-"}</IonCol>
                <IonCol>{t.paid_at ? new Date(t.paid_at).toLocaleString() : "-"}</IonCol>
                <IonCol>{new Date(t.created_at).toLocaleString()}</IonCol>
              </IonRow>
            ))}
          </IonGrid>
        )}

        <IonToast
          isOpen={!!errorToast}
          message={errorToast || ""}
          duration={2500}
          color="danger"
          onDidDismiss={() => setErrorToast(null)}
        />
      </IonContent>
    </IonPage>
  );
};

export default Admin_ViewAllTransactions;
