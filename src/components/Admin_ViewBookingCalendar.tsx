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

  // Fetch bookings from Supabase
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

    const channel = supabase
      .channel("bookings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        (payload) => {
          console.log("Realtime change:", payload);
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const bookingsForDate = bookings.filter(
    (b) => new Date(b.start_date).toDateString() === selectedDate.toDateString()
  );

  return (
    <IonContent className="ion-padding">
      <h2>📅 Booking Management</h2>
      <p>Select a date to view bookings.</p>

      {loading ? (
        <IonSpinner name="crescent" />
      ) : (
        <>
          {/* Calendar */}
          <div className="calendar-container">
            <Calendar
              onChange={(date) => setSelectedDate(date as Date)}
              value={selectedDate}
              showWeekNumbers={false}
              tileClassName={({ date }) =>
                bookings.some(
                  (b) =>
                    new Date(b.start_date).toDateString() === date.toDateString()
                )
                  ? "has-booking"
                  : ""
              }
            />
          </div>

          {/* Booking list */}
          <div style={{ marginTop: "16px" }}>
            <h3>
              Bookings on {selectedDate.toDateString()} (
              {bookingsForDate.length})
            </h3>
            {bookingsForDate.length === 0 ? (
              <p>No bookings for this date.</p>
            ) : (
              bookingsForDate.map((b) => (
                <IonCard key={b.id}>
                  <IonCardContent>
                    <strong>{b.equipment_name}</strong> <br />
                    {b.start_date} → {b.end_date} <br />
                    Status:{" "}
                    <span
                      style={{
                        color:
                          b.status === "approved"
                            ? "green"
                            : b.status === "pending"
                            ? "orange"
                            : "red",
                      }}
                    >
                      {b.status}
                    </span>
                  </IonCardContent>
                </IonCard>
              ))
            )}
          </div>
        </>
      )}

      {/* Styles */}
      <style>{`
        .calendar-container {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .react-calendar {
          width: 80%;
          max-width: 900px;
          font-size: 1.2rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
