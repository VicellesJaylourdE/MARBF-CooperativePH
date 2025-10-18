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

      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
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

      if (newStatus === "approved" && totalPrice && userId) {
        const { error: insertError } = await supabase
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
          ]);
        if (insertError) throw insertError;
        setToastMessage("✅ Booking approved and transaction created!");
      } else if (newStatus === "declined") {
        setToastMessage("❌ Booking declined.");
      }

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (error: any) {
      console.error("Error updating booking:", error.message);
      setToastMessage("Error updating booking status.");
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

  return (
    <IonContent className="ion-padding">
      <div style={{ textAlign: "left", marginBottom: "1rem" }}>
        <h1 style={{ fontWeight: 600, fontSize: "1.2rem" }}>Manage Rental Bookings</h1>
        <p style={{ color: "#666", fontSize: "0.80rem" }}>
          View, approve, or decline rental equipment bookings.
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
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "850px" }}>
            <thead style={{ backgroundColor: "#000000ff" }}>
              <tr>
                <th style={headerStyle}>Equipment</th>
                <th style={headerStyle}>Booked By</th>
                <th style={headerStyle}>Days</th>
                <th style={headerStyle}>Start Date</th>
                <th style={headerStyle}>End Date</th>
                <th style={headerStyle}>Location</th>
                <th style={headerStyle}>Price</th>
                <th style={headerStyle}>Status</th>
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
