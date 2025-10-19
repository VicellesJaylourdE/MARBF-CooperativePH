import React, { useEffect, useState } from "react";
import { IonContent, IonBadge, IonSpinner, IonButton, IonToast } from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

interface Transaction {
  id: string;
  status: string;
  amount: number;
  paid_at: string | null;
  created_at: string;
}

interface Booking {
  id: string;
  user_id: number;
  equipment_name: string;
  start_date: string;
  end_date: string;
  location: string | null;
  status: string;
  total_price: number | null;
  user_name?: string;
  transaction?: Transaction[];
}

const headerStyle: React.CSSProperties = {
  padding: "10px",
  fontWeight: 600,
  fontSize: "0.95rem",
  borderBottom: "1px solid #ddd",
  textAlign: "center",
};

const cellStyle: React.CSSProperties = {
  padding: "8px",
  fontSize: "0.9rem",
  borderBottom: "1px solid #eee",
  textAlign: "center",
};

const Admin_ManageRentalBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .order("start_date", { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("user_id, username, user_firstname, user_lastname");

      if (usersError) throw usersError;

      // Fetch latest transaction per booking
      const bookingIds = bookingsData?.map((b) => b.id) || [];
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .in("booking_id", bookingIds)
        .order("created_at", { ascending: false });

      if (transactionsError) throw transactionsError;

      // Merge bookings, users, and latest transaction
      const mergedBookings = bookingsData?.map((booking) => {
        const user = usersData?.find((u) => u.user_id === booking.user_id);
        const latestTransaction = transactionsData
          ?.filter((t) => t.booking_id === booking.id)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        return {
          ...booking,
          user_name: user
            ? user.username ||
              `${user.user_firstname || ""} ${user.user_lastname || ""}`.trim()
            : "Unknown Farmer",
          transaction: latestTransaction ? [latestTransaction] : [],
        };
      });

      setBookings(mergedBookings || []);
    } catch (error: any) {
      console.error("Error fetching bookings:", error.message);
      setToastMessage("Error fetching bookings.");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (
    bookingId: string,
    newStatus: string,
    userId: number,
    totalPrice: number | null
  ) => {
    try {
      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          approved_at: newStatus === "approved" ? new Date().toISOString() : null,
        })
        .eq("id", bookingId);
      if (updateError) throw updateError;

      // Create transaction if approved
      if (newStatus === "approved" && totalPrice && userId) {
        const { data: newTransaction, error: insertError } = await supabase
          .from("transactions")
          .insert([
            {
              booking_id: bookingId,
              user_id: userId,
              amount: totalPrice,
              status: "unpaid",
              payment_method: "gcash",
              created_at: new Date().toISOString(),
            },
          ])
          .select();

        if (insertError) throw insertError;

        // Update local state with new transaction
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? { ...b, status: newStatus, transaction: newTransaction }
              : b
          )
        );

        setToastMessage("✅ Booking approved and transaction created!");
      } else if (newStatus === "declined") {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
        setToastMessage("❌ Booking declined.");
      }
    } catch (error: any) {
      console.error("Error updating booking:", error.message);
      setToastMessage("Error updating booking status.");
    }
  };

  const markTransactionPaid = async (transactionId: string) => {
    try {
      const paidAt = new Date().toISOString();
      const { error } = await supabase
        .from("transactions")
        .update({
          status: "paid",
          paid_at: paidAt,
        })
        .eq("id", transactionId);

      if (error) throw error;

      // Update local state directly to prevent duplicates
      setBookings((prev) =>
        prev.map((booking) => {
          if (booking.transaction) {
            const updatedTrans = booking.transaction.map((t) =>
              t.id === transactionId ? { ...t, status: "paid", paid_at: paidAt } : t
            );
            return { ...booking, transaction: updatedTrans };
          }
          return booking;
        })
      );

      setToastMessage("✅ Transaction marked as paid!");
    } catch (err: any) {
      console.error("Error marking transaction paid:", err.message);
      setToastMessage("Error marking transaction paid.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#28a745";
      case "declined":
        return "#dc3545";
      case "cancelled":
        return "#6c757d";
      case "pending":
      default:
        return "#fd7e14";
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "paid":
        return "#4caf50";
      case "unpaid":
        return "#ff9800";
      case "cancelled":
        return "#6c757d";
      default:
        return "#999999";
    }
  };

  return (
    <IonContent className="ion-padding">
      <div style={{ textAlign: "left", marginBottom: "1rem" }}>
        <h1 style={{ fontWeight: 600, fontSize: "1.2rem" }}>Manage Rental Bookings</h1>
        <p style={{ color: "#666", fontSize: "0.80rem" }}>
          View, approve, or decline rental equipment bookings.
        </p>
        <p style={{ color: "#333", fontSize: "0.85rem" }}>
          Total Bookings: {bookings.length}
        </p>
      </div>

      {loading ? (
        <div className="ion-text-center ion-padding">
          <IonSpinner name="crescent" />
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: "center", color: "#666" }}>No bookings found.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
            <thead style={{ backgroundColor: "#000000ff" }}>
              <tr>
                <th style={headerStyle}>#</th> {/* Number Column */}
                <th style={headerStyle}>Equipment</th>
                <th style={headerStyle}>Booked By</th>
                <th style={headerStyle}>Days</th>
                <th style={headerStyle}>Start Date</th>
                <th style={headerStyle}>End Date</th>
                <th style={headerStyle}>Location</th>
                <th style={headerStyle}>Price</th>
                <th style={headerStyle}>Status</th>
                <th style={headerStyle}>Payment Status</th>
                <th style={headerStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, index) => (
                <tr
                  key={booking.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#080808ff" : "#141414ff",
                  }}
                >
                  <td style={cellStyle}>{index + 1}</td> {/* Number Column */}
                  <td style={cellStyle}>{booking.equipment_name}</td>
                  <td style={cellStyle}>{booking.user_name}</td>
                  <td style={cellStyle}>{booking.user_id}</td>
                  <td style={cellStyle}>{booking.start_date}</td>
                  <td style={cellStyle}>{booking.end_date}</td>
                  <td style={cellStyle}>{booking.location || "N/A"}</td>
                  <td style={cellStyle}>
                    {booking.total_price
                      ? `₱${booking.total_price.toLocaleString()}`
                      : "N/A"}
                  </td>
                  <td style={cellStyle}>
                    <IonBadge
                      style={{
                        backgroundColor: getStatusColor(booking.status),
                        color: "#000000ff",
                        fontWeight: 600,
                        padding: "0.35em 0.6em",
                        borderRadius: "12px",
                      }}
                    >
                      {booking.status.toUpperCase()}
                    </IonBadge>
                  </td>
                  <td style={cellStyle}>
                    {booking.transaction && booking.transaction[0] ? (
                      <IonBadge
                        style={{
                          backgroundColor: getPaymentColor(booking.transaction[0].status),
                          color: "#000000ff",
                          fontWeight: 600,
                          padding: "0.35em 0.6em",
                          borderRadius: "12px",
                        }}
                      >
                        {booking.transaction[0].status.toUpperCase()}
                      </IonBadge>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td style={cellStyle}>
                    {booking.status === "pending" && (
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          justifyContent: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <IonButton
                          size="small"
                          color="success"
                          onClick={() =>
                            updateBookingStatus(
                              booking.id,
                              "approved",
                              booking.user_id,
                              booking.total_price
                            )
                          }
                        >
                          Approve
                        </IonButton>
                        <IonButton
                          size="small"
                          color="danger"
                          onClick={() =>
                            updateBookingStatus(
                              booking.id,
                              "declined",
                              booking.user_id,
                              booking.total_price
                            )
                          }
                        >
                          Cancel
                        </IonButton>
                      </div>
                    )}

                    {booking.status === "approved" &&
                      booking.transaction &&
                      booking.transaction[0]?.status === "unpaid" && (
                        <IonButton
                          size="small"
                          color="primary"
                          onClick={() =>
                            markTransactionPaid(booking.transaction![0].id)
                          }
                        >
                          Mark as Paid
                        </IonButton>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <IonToast
        isOpen={!!toastMessage}
        message={toastMessage || ""}
        duration={2000}
        onDidDismiss={() => setToastMessage(null)}
      />
    </IonContent>
  );
};

export default Admin_ManageRentalBookings;
