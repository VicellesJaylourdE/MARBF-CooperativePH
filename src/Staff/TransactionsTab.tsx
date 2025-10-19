import React, { useEffect, useState } from "react";
import { IonContent, IonPage, IonGrid, IonRow, IonCol, IonSpinner, IonToast, IonSelect, IonSelectOption } from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

interface Transaction {
  id: string;
  booking_id: string | null;
  user_id: number | null;
  user_name?: string;
  amount: number;
  status: "unpaid" | "paid" | "cancelled";
  payment_method: "cash" | "gcash" | null;
  proof_url: string | null;
  paid_at: string | null;
  created_at: string;
  equipment_name?: string;
}

const TransactionsTab: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPayment, setFilterPayment] = useState<string>("all");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const { data: transData, error: transError } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (transError) throw transError;

      const bookingIds = Array.from(new Set(transData?.map((t) => t.booking_id).filter(Boolean)));
      const userIds = Array.from(new Set(transData?.map((t) => t.user_id).filter(Boolean)));

      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("id, equipment_name")
        .in("id", bookingIds);
      if (bookingsError) throw bookingsError;

      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("user_id, username")
        .in("user_id", userIds);
      if (usersError) throw usersError;

      const merged = transData.map((t) => {
        const booking = bookingsData?.find((b) => b.id === t.booking_id);
        const user = usersData?.find((u) => u.user_id === t.user_id);
        return {
          ...t,
          equipment_name: booking?.equipment_name || "-",
          user_name: user?.username || "-",
        };
      });

      setTransactions(merged || []);
    } catch (err: any) {
      console.error(err);
      setErrorToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    const statusMatch = filterStatus === "all" || t.status === filterStatus;
    const paymentMatch = filterPayment === "all" || t.payment_method === filterPayment;
    return statusMatch && paymentMatch;
  });

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h2 style={{ fontWeight: "bold", fontSize: "1.3rem" }}>View All Transactions</h2>
        <p>List of all transactions with Booking ID, Equipment, User, and payment proof images.</p>
        <p style={{ fontWeight: 600 }}>Total Transactions: {filteredTransactions.length}</p>

        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <IonSelect value={filterStatus} placeholder="Filter by Status" onIonChange={(e) => setFilterStatus(e.detail.value)}>
            <IonSelectOption value="all">All Status</IonSelectOption>
            <IonSelectOption value="unpaid">Unpaid</IonSelectOption>
            <IonSelectOption value="paid">Paid</IonSelectOption>
            <IonSelectOption value="cancelled">Cancelled</IonSelectOption>
          </IonSelect>

          <IonSelect value={filterPayment} placeholder="Filter by Payment Method" onIonChange={(e) => setFilterPayment(e.detail.value)}>
            <IonSelectOption value="all">All Methods</IonSelectOption>
            <IonSelectOption value="cash">Cash</IonSelectOption>
            <IonSelectOption value="gcash">GCash</IonSelectOption>
          </IonSelect>
        </div>

        {loading ? (
          <div className="ion-text-center" style={{ marginTop: "30px" }}>
            <IonSpinner name="crescent" />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <p className="ion-text-center">No transactions found.</p>
        ) : (
          <IonGrid>
            <IonRow
              style={{
                fontWeight: "bold",
                background: "#030303ff",
                color: "white",
                padding: "8px 0",
                fontSize: "0.9rem",
              }}
            >
              <IonCol>#</IonCol>
              <IonCol>Equipment</IonCol>
              <IonCol>Bookid By</IonCol>
              <IonCol>Amount</IonCol>
              <IonCol>Status</IonCol>
              <IonCol>Payment Method</IonCol>
              <IonCol>Proof</IonCol>
              <IonCol>Paid At</IonCol>
              <IonCol>Created At</IonCol>
            </IonRow>

            {filteredTransactions.map((t, index) => (
              <IonRow
                key={t.id}
                style={{
                  borderBottom: "1px solid #040404ff",
                  padding: "6px 0",
                  fontSize: "0.85rem",
                }}
              >
                <IonCol>{index + 1}</IonCol> {/* Number */}
                <IonCol>{t.equipment_name || "-"}</IonCol>
                <IonCol>{t.user_name || "-"}</IonCol>
                <IonCol>₱{Number(t.amount).toFixed(2)}</IonCol>
                <IonCol
                  style={{
                    color: t.status === "paid" ? "green" : t.status === "cancelled" ? "red" : "#555",
                  }}
                >
                  {t.status}
                </IonCol>
                <IonCol>{t.payment_method || "-"}</IonCol>
                <IonCol>
                  {t.proof_url ? (
                    <img
                      src={t.proof_url}
                      alt="Proof"
                      style={{
                        width: "70px",
                        height: "70px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                      onClick={() => window.open(t.proof_url!, "_blank")}
                    />
                  ) : (
                    "-"
                  )}
                </IonCol>
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

export default TransactionsTab;
