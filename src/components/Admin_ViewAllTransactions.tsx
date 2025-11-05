import React, { useEffect, useState, useMemo } from "react";
import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  IonToast,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

interface Transaction {
  id: string;
  booking_id: string | null;
  user_id: number | null;
  user_name?: string;
  equipment_name?: string;
  amount: number;
  status: "unpaid" | "paid" | "cancelled";
  payment_method: "cash" | "gcash" | null;
  proof_url: string | null;
  gcash_ref_no?: string | null;
  quantity?: number;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

const Admin_ViewAllTransactions: React.FC = () => {
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
        .select(`
          *,
          bookings(id, equipment_name),
          users(user_id, username)
        `)
        .order("created_at", { ascending: false });

      if (transError) throw transError;
      if (!transData) {
        setTransactions([]);
        return;
      }

      const mappedTransactions: Transaction[] = transData.map((t: any) => ({
        id: t.id,
        booking_id: t.booking_id,
        user_id: t.user_id,
        amount: t.amount,
        status: t.status,
        payment_method: t.payment_method,
        proof_url: t.proof_url || null,
        gcash_ref_no: t.gcash_ref_no || null,
        quantity: t.quantity ?? 1,
        paid_at: t.paid_at,
        created_at: t.created_at,
        updated_at: t.updated_at,
        equipment_name: t.bookings?.equipment_name || "-",
        user_name: t.users?.username || "-",
      }));

      setTransactions(mappedTransactions);
    } catch (err: any) {
      console.error(err);
      setErrorToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const statusMatch = filterStatus === "all" || t.status === filterStatus;
      const paymentMatch =
        filterPayment === "all" || t.payment_method === filterPayment;
      return statusMatch && paymentMatch;
    });
  }, [transactions, filterStatus, filterPayment]);

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h2 style={{ fontWeight: "bold", fontSize: "1.3rem" }}>
          View All Transactions
        </h2>
        <p>
          List of all transactions with Booking, User, Quantity, payment proof
          images, and GCash Reference Numbers.
        </p>
        <p style={{ fontWeight: 600 }}>
          Total Transactions: {filteredTransactions.length}
        </p>

        <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
          <IonSelect
            value={filterStatus}
            placeholder="Filter by Status"
            onIonChange={(e) => setFilterStatus(e.detail.value)}
          >
            <IonSelectOption value="all">All Status</IonSelectOption>
            <IonSelectOption value="unpaid">Unpaid</IonSelectOption>
            <IonSelectOption value="paid">Paid</IonSelectOption>
            <IonSelectOption value="cancelled">Cancelled</IonSelectOption>
          </IonSelect>

          <IonSelect
            value={filterPayment}
            placeholder="Filter by Payment Method"
            onIonChange={(e) => setFilterPayment(e.detail.value)}
          >
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
              <IonCol>Booked By</IonCol>
              <IonCol>Quantity</IonCol>
              {/* Removed Price Type */}
              <IonCol>Amount</IonCol>
              <IonCol>Status</IonCol>
              <IonCol>Payment Method</IonCol>
              <IonCol>GCash Ref</IonCol>
              <IonCol>Proof</IonCol>
              <IonCol>Paid At</IonCol>
              <IonCol>Created At</IonCol>
              <IonCol>Updated At</IonCol>
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
                <IonCol>{index + 1}</IonCol>
                <IonCol>{t.equipment_name}</IonCol>
                <IonCol>{t.user_name}</IonCol>
                <IonCol>{t.quantity}</IonCol>
                {/* Removed Price Type */}
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
                <IonCol>{t.gcash_ref_no || "-"}</IonCol>
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
                <IonCol>
                  {t.paid_at ? new Date(t.paid_at).toLocaleString() : "-"}
                </IonCol>
                <IonCol>{new Date(t.created_at).toLocaleString()}</IonCol>
                <IonCol>{new Date(t.updated_at).toLocaleString()}</IonCol>
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
