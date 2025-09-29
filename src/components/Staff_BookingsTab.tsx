import React, { useEffect, useState } from "react";
import { IonContent, IonSpinner, IonCard, IonCardContent } from "@ionic/react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // base styles
import { supabase } from "../utils/supabaseClient";

interface Booking {
  id: number;
  user_name: string;
  date: string;
  status: string;
}

const BookingsTab: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("id, user_name, date, status")
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching bookings:", error.message);
      } else {
        setBookings(data || []);
      }
      setLoading(false);
    };

    fetchBookings();
  }, []);

  const bookingsForDate = bookings.filter(
    (b) => new Date(b.date).toDateString() === selectedDate.toDateString()
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
              showWeekNumbers={false} // optional, hide week numbers
              tileClassName={({ date }) =>
                bookings.some(
                  (b) => new Date(b.date).toDateString() === date.toDateString()
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
                    <strong>{b.user_name}</strong> <br />
                    Status:{" "}
                    <span
                      style={{
                        color:
                          b.status === "confirmed"
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

      {/* Inline styles */}
      <style>{`
        .calendar-container {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .react-calendar {
          width: 80%; /* laptop size */
          max-width: 900px;
          font-size: 1.2rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        /* header color */
        .react-calendar__navigation {
          background-color: #FCB53B;
          border-top-left-radius: px;
          border-top-right-radius: px;
        }
        .react-calendar__navigation button {
          color: white;
          font-weight: bold;
          font-size: 1.1rem;
        }

        /* weekdays row (Mon–Sun) */
        .react-calendar__month-view__weekdays {
          background: #FCB53B; /* same as header */
          font-weight: bold;
          text-align: center;
          text-transform: uppercase;
          color: white;
        }
        .react-calendar__month-view__weekdays__weekday {
          padding: 0.5rem;
        }

        /* highlight days with bookings */
        .has-booking {
          background: #ffe9c4 !important;
          border-radius: 50%;
        }

        /* selected date highlight */
        .react-calendar__tile--active {
          background: #FCB53B !important;
          color: white !important;
          border-radius: 50%;
        }

        /* Mobile responsive */
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

export default BookingsTab;
