import React, { useEffect, useState } from "react"; 
import { IonContent, IonSpinner, IonCard, IonCardContent } from "@ionic/react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { supabase } from "../utils/supabaseClient";

interface Booking {
  id: string;
  equipment_name: string;
  start_date: string;
  end_date: string;
  status: string;
  total_price: number;
  user_id: string;
}

const Admin_ViewBookingCalendar: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("id, equipment_name, start_date, end_date, status, total_price, user_id")
        .order("start_date", { ascending: true });

      if (error) {
        console.error("❌ Error fetching bookings:", error.message);
      } else {
        setBookings(data || []);
      }
      setLoading(false);
    };

    fetchBookings();

    // Supabase realtime subscription
    const channel = supabase
      .channel("bookings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Check if a date falls in any booking
  const getBookingsOnDate = (date: Date) => {
    return bookings.filter((b) => {
      const start = new Date(b.start_date);
      const end = new Date(b.end_date);
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
      return date >= start && date <= end;
    });
  };

  // Color coding for booking status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#28a745";
      case "pending":
        return "#fd7e14";
      case "declined":
        return "#dc3545";
      case "cancelled":
        return "#6c757d";
      case "returned":
        return "#17a2b8";
      default:
        return "#999";
    }
  };

  // Bookings for selected date
  const bookingsForSelectedDate = getBookingsOnDate(selectedDate);

  return (
    <IonContent className="ion-padding">
      <h2>Booking Management</h2>
      {loading ? (
        <IonSpinner name="crescent" />
      ) : (
        <>
          <div className="calendar-container">
            <Calendar
              onChange={(date) => setSelectedDate(date as Date)}
              value={selectedDate}
              showWeekNumbers={false}
              tileClassName={({ date }) =>
                getBookingsOnDate(date).length > 0 ? "has-booking" : ""
              }
              tileContent={({ date }) => {
                const dayBookings = getBookingsOnDate(date);
                if (dayBookings.length === 0) return null;

                // Multiple bookings indicator (small colored dots)
                return (
                  <div style={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
                    {dayBookings.map((b, i) => (
                      <span
                        key={i}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          backgroundColor: getStatusColor(b.status),
                          margin: "0 1px",
                          display: "inline-block",
                        }}
                      />
                    ))}
                  </div>
                );
              }}
            />
          </div>

          <div style={{ marginTop: "16px" }}>
            <h3>
              Bookings on {selectedDate.toDateString()} ({bookingsForSelectedDate.length})
            </h3>
            {bookingsForSelectedDate.length === 0 ? (
              <p>No bookings for this date.</p>
            ) : (
              bookingsForSelectedDate.map((b) => (
                <IonCard key={b.id}>
                  <IonCardContent>
                    <strong>{b.equipment_name}</strong> <br />
                    {b.start_date} → {b.end_date} <br />
                    Status:{" "}
                    <span style={{ color: getStatusColor(b.status), fontWeight: 600 }}>
                      {b.status.toUpperCase()}
                    </span>{" "}
                    <br />
                    Total Price: ₱{b.total_price.toLocaleString()}
                  </IonCardContent>
                </IonCard>
              ))
            )}
          </div>
        </>
      )}

      <style>{`
        .calendar-container {
          display: flex;
          justify-content: center;
          width: 100%;
          position: relative;
        }
        .react-calendar {
          width: 90%;
          max-width: 900px;
          font-size: 1.5rem;
          border-radius: 1px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .react-calendar__navigation {
          background-color: #FCB53B;
        }
        .react-calendar__navigation button {
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
        }
        .react-calendar__month-view__weekdays {
          background: #FCB53B;
          font-weight: bold;
          text-align: center;
          text-transform: uppercase;
          color: white;
        }
        .react-calendar__month-view__weekdays__weekday {
          padding: 0.5rem;
        }
        .has-booking {
          background: #ffe9c4 !important;
          border-radius: 50%;
        }
        .react-calendar__tile--active {
          background: #FCB53B !important;
          color: white !important;
          border-radius: 50%;
        }
        @media (max-width: 768px) {
          .react-calendar {
            width: 95%;
            font-size: 1rem;
          }
        }
      `}</style>
    </IonContent>
  );
};

export default Admin_ViewBookingCalendar;
