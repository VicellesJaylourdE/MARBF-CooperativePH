import React, { useEffect, useState, useMemo } from "react";
import { IonContent, IonBadge, IonSpinner, IonButton, IonToast } from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

interface Booking {
  id: string;
  user_id: number;
  equipment_id: string | null;
  equipment_name: string;
  start_date: string;
  end_date: string;
  location: string | null;
  payment_method: "cash" | "gcash";
  status: "pending" | "approved" | "in_use" | "declined" | "cancelled" | "returned";
  total_price: number | null;
  approved_by: number | null;
  approved_at: string | null;
  returned_at: string | null;
  created_at: string;
  updated_at: string;
  user_name?: string;
  quantity?: number;
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
  borderBottom: "1px solid #000000ff",
  textAlign: "center",
};

const cellStyle: React.CSSProperties = {
  padding: "8px",
  fontSize: "0.9rem",
  borderBottom: "1px solid #000000ff",
  textAlign: "center",
};

const isStartDayOrPassed = (startDate: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  return start.getTime() <= today.getTime();
};

const isEndDayPassed = (endDate: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  return end.getTime() < today.getTime();
};

const Admin_ManageRentalBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"earliest" | "latest">("latest");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`*, transaction:transactions!booking_id(id, status, amount, paid_at)`)
        .order("created_at", { ascending: false });

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
            : "Unknown User",
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
    newStatus: Booking["status"],
    userId: number,
    totalPrice: number | null
  ) => {
    try {
      setProcessingIds((prev) => [...prev, bookingId]);

      const booking = bookings.find((b) => b.id === bookingId);

      const { error: updateError } = await supabase
        .from("bookings")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          approved_at: newStatus === "approved" ? new Date().toISOString() : null,
          approved_by: newStatus === "approved" ? userId : null,
        })
        .eq("id", bookingId);
      if (updateError) throw updateError;

      /** ============================
       *  FIX: PAYMENT METHOD FOLLOWS BOOKING
       *  ============================ */
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
              payment_method: booking?.payment_method, // 🔥 follow CASH or GCASH
              created_at: new Date().toISOString(),
            },
          ]);
          if (insertError) throw insertError;
          setToastMessage("✅ Booking approved and transaction created!");
        }
      } else if (newStatus === "declined") {
        setToastMessage("❌ Booking declined.");
      } else if (newStatus === "in_use") {
        setToastMessage("🚀 Booking status updated to In Use.");
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

  const markBookingInUse = async (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking || booking.status === "in_use") {
      setToastMessage("⚠️ Booking is already in use.");
      return;
    }

    await updateBookingStatus(bookingId, "in_use", booking.user_id, booking.total_price);
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
                transaction: [
                  {
                    ...b.transaction[0],
                    status: "paid",
                    paid_at: new Date().toISOString(),
                  },
                ],
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

      await supabase.from("inventory_logs").insert([
        {
          equipment_id: booking.equipment_id,
          user_id: booking.user_id,
          reference_booking: booking.id,
          action: "return",
          quantity_change: booking.quantity || 1,
          created_at: new Date().toISOString(),
        },
      ]);

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

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "approved":
        return "#28a745";
      case "in_use":
        return "#007bff";
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

  const filteredBookings = useMemo(() => {
    let filtered = bookings.filter(
      (b) =>
        b.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const dateA = new Date(a.start_date).getTime();
      const dateB = new Date(b.start_date).getTime();

      return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [bookings, searchTerm, sortOrder]);

  return (
    <IonContent className="ion-padding">
      {/* Search + Sort */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search users or equipment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            width: "250px",
          }}
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "earliest" | "latest")}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          <option value="latest">Latest Start Date (Soonest)</option>
          <option value="earliest">Earliest Start Date (Longest Ago)</option>
        </select>
      </div>

      {loading ? (
        <div className="ion-text-center ion-padding">
          <IonSpinner name="crescent" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div style={{ textAlign: "center", color: "#666" }}>No bookings found.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}
          >
            <thead style={{ backgroundColor: "#f59701ff" }}>
              <tr>
                <th style={headerStyle}>#</th>
                <th style={headerStyle}>Equipment</th>
                <th style={headerStyle}>Booked By</th>
                <th style={headerStyle}>Start</th>
                <th style={headerStyle}>End</th>
                <th style={headerStyle}>Location</th>
                <th style={headerStyle}>Price</th>
                <th style={headerStyle}>Status</th>
                <th style={headerStyle}>Payment</th>
                <th style={headerStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b, idx) => {
                const isReadyToStart = isStartDayOrPassed(b.start_date);
                const isReadyToReturn = isEndDayPassed(b.end_date);

                const isPaid = b.transaction?.[0]?.status === "paid";

                const canStartUse = b.status === "approved" && isPaid && isReadyToStart;
                const canReturn =
                  (b.status === "in_use" ||
                    (b.status === "approved" && isReadyToReturn)) &&
                  isPaid;

                const isProcessing =
                  processingIds.includes(b.id) ||
                  (b.transaction?.[0]?.id &&
                    processingIds.includes(b.transaction[0].id));

                return (
                  <tr key={b.id}>
                    <td style={cellStyle}>{idx + 1}</td>
                    <td style={cellStyle}>{b.equipment_name}</td>
                    <td style={cellStyle}>{b.user_name}</td>
                    <td style={cellStyle}>{b.start_date}</td>
                    <td style={cellStyle}>{b.end_date}</td>
                    <td style={cellStyle}>{b.location || "N/A"}</td>
                    <td style={cellStyle}>
                      {b.total_price
                        ? `₱${b.total_price.toLocaleString()}`
                        : "N/A"}
                    </td>
                    <td style={cellStyle}>
                      <IonBadge
                        style={{
                          backgroundColor: getStatusColor(b.status),
                          color: "#fff",
                        }}
                      >
                        {b.status.toUpperCase().replace("_", " ")}
                      </IonBadge>
                    </td>
                    <td style={cellStyle}>
                      {b.transaction?.[0] ? (
                        <IonBadge
                          style={{
                            backgroundColor: getPaymentColor(
                              b.transaction[0].status
                            ),
                            color: "#fff",
                          }}
                        >
                          {b.transaction[0].status.toUpperCase()}
                        </IonBadge>
                      ) : (
                        <>
                          {b.payment_method === "cash" ? (
                            <IonBadge style={{ backgroundColor: "#795548", color: "#fff" }}>
                              CASH
                            </IonBadge>
                          ) : (
                            "N/A"
                          )}
                        </>
                      )}
                    </td>

                    <td style={cellStyle} className="ion-text-wrap">
                      {isProcessing && <IonSpinner name="dots" />}
                      {!isProcessing && (
                        <>
                          {b.status === "pending" && (
                            <>
                              <IonButton
                                size="small"
                                color="success"
                                onClick={() =>
                                  updateBookingStatus(
                                    b.id,
                                    "approved",
                                    b.user_id,
                                    b.total_price
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
                                    b.id,
                                    "declined",
                                    b.user_id,
                                    b.total_price
                                  )
                                }
                              >
                                Decline
                              </IonButton>
                            </>
                          )}

                          {b.status === "approved" &&
                            b.transaction?.[0]?.status === "unpaid" && (
                              <IonButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                  markTransactionPaid(b.transaction![0].id)
                                }
                              >
                                Mark Paid
                              </IonButton>
                            )}

                          {canStartUse && b.status !== "in_use" && (
                            <IonButton
                              size="small"
                              color="secondary"
                              onClick={() => markBookingInUse(b.id)}
                            >
                              Start Use
                            </IonButton>
                          )}

                          {canReturn && b.status !== "returned" && (
                            <IonButton
                              size="small"
                              color="warning"
                              onClick={() => markBookingReturned(b.id)}
                            >
                              Mark Returned
                            </IonButton>
                          )}
                        </>
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

export default Admin_ManageRentalBookings;
