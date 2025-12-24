import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonSpinner,
  IonCard,
} from "@ionic/react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { supabase } from "../utils/supabaseClient";

interface Booking {
  id: string;
  user_id: number;
  equipment_name: string;
  start_date: string;
  end_date: string;
  status: "pending" | "approved" | "in_use" | "declined" | "cancelled" | "returned";
  total_price: number;
  quantity: number;
  user_name?: string;
}

const Farmer_CalendarView: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchAndMergeBookings = async () => {
      setLoading(true);
      try {
        // ✅ Get logged-in user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          console.error("❌ No logged-in user found.");
          setBookings([]);
          setLoading(false);
          return;
        }

        // ✅ Get user_id from "users" table using email (same as UserDashboard)
        const { data: userData, error: userDataError } = await supabase
          .from("users")
          .select("user_id, username, user_firstname, user_lastname")
          .eq("user_email", user.email)
          .single();

        if (userDataError || !userData) {
          console.error("❌ No matching user record found:", userDataError?.message);
          setBookings([]);
          setLoading(false);
          return;
        }

        // ✅ Fetch only bookings of this user
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select("id, user_id, equipment_name, start_date, end_date, status, total_price, quantity")
          .eq("user_id", userData.user_id)
          .order("start_date", { ascending: true });

        if (bookingsError) throw bookingsError;

        // ✅ Merge user info into bookings
        const merged: Booking[] = (bookingsData as any[]).map((booking) => ({
          ...booking,
          user_name:
            userData.username ||
            `${userData.user_firstname || ""} ${userData.user_lastname || ""}`.trim() ||
            "Unknown User",
          quantity: booking.quantity || 1,
        }));

        setBookings(merged);
      } catch (error: any) {
        console.error("❌ Error fetching or merging bookings:", error.message);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAndMergeBookings();

    // ✅ Real-time updates (auto refresh calendar)
    const channel = supabase
      .channel("bookings-changes-calendar")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          fetchAndMergeBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  
  const getBookingsOnDate = (date: Date) => {
    const selectedDateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

    return bookings.filter((b) => {
      // 🛑 MODIFICATION: Exclude 'returned' AND 'cancelled' bookings from calendar view and list
      if (b.status === "returned" || b.status === "cancelled") {
          return false;
      }
      
      const start = new Date(b.start_date);
      const end = new Date(b.end_date);

      const tempStart = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
      ).getTime();
      const tempEnd = new Date(
        end.getFullYear(),
        end.getMonth(),
        end.getDate()
      ).getTime();

      return selectedDateOnly >= tempStart && selectedDateOnly <= tempEnd;
    });
  };

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "approved":
        return "#28a745";
      case "in_use":
        return "#007bff";
      case "pending":
        return "#fd7e14";
      case "declined":
        return "#dc3545";
      case "cancelled":
        return "#6c757d"; // Unused for calendar/list now
      case "returned":
        return "#17a2b8"; // Unused for calendar/list now
      default:
        return "#999";
    }
  };

  const bookingsForSelectedDate = getBookingsOnDate(selectedDate);

  const cardContentStyle: React.CSSProperties = {
    padding: "15px",
    backgroundColor: "#fff",
  };

  const getCardStyle = (status: Booking["status"]): React.CSSProperties => ({
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "10px",
    borderLeft: `5px solid ${getStatusColor(status)}`,
    padding: "0",
    margin: "10px 0",
  });

  return (
    <IonContent className="ion-padding custom-content">
      <h2>Booking Management Calendar</h2>

      {loading ? (
        <div className="ion-text-center ion-padding">
          <IonSpinner name="crescent" color="warning" />
          <p>Loading Bookings...</p>
        </div>
      ) : (
        <>
          <div className="calendar-container">
            <Calendar
              onChange={(date) => setSelectedDate(date as Date)}
              value={selectedDate}
              showWeekNumbers={false}
              tileClassName={({ date }) =>
                // Uses the filtered list: 'returned' and 'cancelled' bookings don't count for highlighting
                getBookingsOnDate(date).length > 0 ? "has-booking" : ""
              }
              tileContent={({ date }) => {
                // Uses the filtered list: 'returned' and 'cancelled' bookings won't show dots
                const dayBookings = getBookingsOnDate(date);
                if (dayBookings.length === 0) return null;

                return (
                  <div className="booking-dots-container">
                    {dayBookings.slice(0, 3).map((b, i) => (
                      <span
                        key={i}
                        className="dot"
                        style={{
                          backgroundColor: getStatusColor(b.status),
                        }}
                      />
                    ))}
                  </div>
                );
              }}
            />
          </div>

          <div style={{ marginTop: "30px" }}>
            <h3>
              Bookings on {selectedDate.toDateString()} (
              {bookingsForSelectedDate.length})
            </h3>
            {bookingsForSelectedDate.length === 0 ? (
              // The message reflects the filtering of 'returned' and 'cancelled'
              <p>No active (approved, in use, pending, or declined) bookings found for this date.</p>
            ) : (
              bookingsForSelectedDate.map((b) => (
                <IonCard key={b.id} style={getCardStyle(b.status)}>
                  <div style={cardContentStyle}>
                    <div
                      style={{
                        marginBottom: "5px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <strong style={{ fontSize: "1.1em" }}>
                        {b.equipment_name}
                      </strong>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          color: "white",
                          backgroundColor: getStatusColor(b.status),
                          fontWeight: "bold",
                          fontSize: "0.8em",
                        }}
                      >
                        {b.status.toUpperCase().replace("_", " ")}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "3px 0",
                        fontSize: "0.9em",
                        color: "#666",
                      }}
                    >
                      📅 Dates: {b.start_date} → {b.end_date}
                    </p>

                    <p style={{ margin: "3px 0", fontSize: "0.9em" }}>
                      💸 Total: ₱{b.total_price.toLocaleString()}
                    </p>
                  </div>
                </IonCard>
              ))
            )}
          </div>
        </>
      )}

      <style>{`
        .custom-content {
          --padding-start: 16px;
          --padding-end: 16px;
          --padding-top: 16px;
          --padding-bottom: 16px;
          max-width: 1400px;
          margin: 0 auto;
        }
        .calendar-container {
          display: flex;
          justify-content: center;
          width: 100%;
          position: relative;
          margin-top: 20px;
        }
        .react-calendar {
          width: 100%;
          max-width: 1200px;
          border-radius: 12px;
          border: 1px solid #ccc;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          font-family: sans-serif;
          font-size: 1.05rem;
        }
        .react-calendar__navigation {
          background-color: #FCB53B;
          height: 50px;
        }
        .react-calendar__navigation button {
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
          transition: background-color 0.2s;
        }
        .react-calendar__navigation button:hover:not(:disabled) {
          background-color: rgba(255, 255, 255, 0.2);
        }
        .react-calendar__month-view__weekdays {
          background: #fce7b7;
          font-weight: bold;
          text-align: center;
          text-transform: uppercase;
          color: #333;
          font-size: 0.8em;
          padding: 5px 0;
        }
        .has-booking {
          background: #ffe9c4 !important;
          border-radius: 8px !important;
        }
        .react-calendar__tile--active {
          background: #FCB53B !important;
          color: white !important;
        }
        .react-calendar__tile--active:hover {
          background: #e6a735 !important;
        }
        .react-calendar__tile--active.has-booking {
          background: #FCB53B !important;
        }
        .react-calendar__tile--now {
          background: #f0f0f0;
          border-radius: 8px;
        }
        .react-calendar__tile--now:hover {
          background: #e0e0e0;
        }
        .booking-dots-container {
          display: flex;
          justify-content: center;
          margin-top: 2px;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin: 0 1px;
          display: inline-block;
        }
        @media (max-width: 768px) {
          .react-calendar {
            width: 100%;
            font-size: 0.9rem;
            max-width: none;
          }
        }
      `}</style>
    </IonContent>
  );
};

export default Farmer_CalendarView;