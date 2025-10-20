import React, { useEffect, useState } from "react";   
import { IonContent, IonBadge, IonSpinner, IonButton, IonToast } from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

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
  transaction?: {
    id: string;
    status: string;
    amount: number;
    paid_at: string | null;
  }[];
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

const ManageRentalBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<string[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          *,
          transaction:transactions!booking_id(id, status, amount, paid_at)
        `)
        .order("start_date", { ascending: false });

      if (bookingsError) throw bookingsError;

      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("user_id, username, user_firstname, user_lastname");

      if (usersError) throw usersError;

      const merged = bookingsData.map((booking) => {
        const user = usersData?.find((u) => u.user_id === booking.user_id);
        return {
          ...booking,
          user_name: user
            ? user.username ||
              `${user.user_firstname || ""} ${user.user_lastname || ""}`.trim()
            : "Unknown Farmer",
        };
      });

      setBookings(merged || []);
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
      setProcessingIds((prev) => [...prev, bookingId]);

      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          approved_at: newStatus === "approved" ? new Date().toISOString() : null,
        })
        .eq("id", bookingId);
      if (updateError) throw updateError;

      if (newStatus === "approved" && totalPrice && userId) {
        const { data: existingTransactions, error: checkError } = await supabase
          .from("transactions")
          .select("*")
          .eq("booking_id", bookingId)
          .eq("status", "unpaid");

        if (checkError) throw checkError;

        if (existingTransactions && existingTransactions.length > 0) {
          setToastMessage("⚠️ Existing unpaid transaction found. No duplicate created.");
        } else {
          const { error: insertError } = await supabase.from("transactions").insert([
            {
              booking_id: bookingId,
              user_id: userId,
              amount: totalPrice,
              status: "unpaid",
              payment_method: "gcash",
              created_at: new Date().toISOString(),
            },
          ]);

          if (insertError) throw insertError;
          setToastMessage("✅ Booking approved and transaction created!");
        }
      } else if (newStatus === "declined") {
        setToastMessage("❌ Booking declined.");
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (error: any) {
      console.error("Error updating booking:", error.message);
      setToastMessage("Error updating booking status.");
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== bookingId));
    }
  };

  const markTransactionPaid = async (transactionId: string) => {
    try {
      setProcessingIds((prev) => [...prev, transactionId]);

      const { error } = await supabase
        .from("transactions")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
        })
        .eq("id", transactionId);

      if (error) throw error;

      setToastMessage("✅ Transaction marked as paid!");
      setBookings((prev) =>
        prev.map((b) =>
          b.transaction && b.transaction[0]?.id === transactionId
            ? {
                ...b,
                transaction: [{ ...b.transaction[0], status: "paid", paid_at: new Date().toISOString() }],
              }
            : b
        )
      );
    } catch (err: any) {
      console.error("Error marking transaction paid:", err.message);
      setToastMessage("Error marking transaction paid.");
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== transactionId));
    }
  };

  const markBookingReturned = async (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || booking.status === "returned") {
      setToastMessage("⚠️ Booking is already returned.");
      return;
    }

    try {
      setProcessingIds((prev) => [...prev, bookingId]);

      const { error } = await supabase
        .from("bookings")
        .update({
          status: "returned",
          returned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      if (error) throw error;

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "returned" } : b))
      );
      setToastMessage("✅ Booking marked as returned!");
    } catch (err: any) {
      console.error("Return booking error:", err.message);
      setToastMessage("Failed to mark booking as returned.");
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== bookingId));
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
      case "returned":
        return "#17a2b8";
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
                <th style={headerStyle}>#</th>
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
              {bookings.map((booking, index) => {
                const canReturn =
                  booking.status === "approved" &&
                  booking.transaction &&
                  booking.transaction[0]?.status === "paid" &&
                  new Date(booking.end_date) <= new Date();

                const isProcessing = processingIds.includes(booking.id);

                return (
                  <tr
                    key={booking.id}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#080808ff" : "#141414ff",
                    }}
                  >
                    <td style={cellStyle}>{index + 1}</td>
                    <td style={cellStyle}>{booking.equipment_name}</td>
                    <td style={cellStyle}>{booking.user_name}</td>
                    <td style={cellStyle}>
                      {Math.ceil(
                        (new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) || 1}
                    </td>
                    <td style={cellStyle}>{booking.start_date}</td>
                    <td style={cellStyle}>{booking.end_date}</td>
                    <td style={cellStyle}>{booking.location || "N/A"}</td>
                    <td style={cellStyle}>
                      {booking.total_price ? `₱${booking.total_price.toLocaleString()}` : "N/A"}
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
                            disabled={isProcessing}
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
                            disabled={isProcessing}
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
                            disabled={isProcessing}
                            onClick={() => markTransactionPaid(booking.transaction![0].id)}
                          >
                            Mark as Paid
                          </IonButton>
                        )}
                      {canReturn && (
                        <IonButton
                          size="small"
                          color="warning"
                          disabled={isProcessing}
                          onClick={() => markBookingReturned(booking.id)}
                        >
                          Mark as Returned
                        </IonButton>
                      )}
                    </td>
                  </tr>
                );
              })}
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

export default ManageRentalBookings;
