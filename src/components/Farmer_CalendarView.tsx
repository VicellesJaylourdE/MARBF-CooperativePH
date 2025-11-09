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

const Farmer_CalendarView: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("bookings")
        .select("id, equipment_name, start_date, end_date, status, total_price, user_id")
        .eq("status", "approved")
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
        () => fetchBookings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const bookingsForDate = (date: Date) =>
    bookings.filter((b) => {
      const start = new Date(b.start_date);
      const end = new Date(b.end_date);
      return date >= start && date <= end;
    });

  return (
    <IonContent className="ion-padding">
      <h2 className="calendar-title">Bookings Calendar</h2>

      {loading ? (
        <IonSpinner name="crescent" />
      ) : (
        <>
          <div className="calendar-container">
            <Calendar
              onChange={(date) => setSelectedDate(date as Date)}
              value={selectedDate}
              tileClassName={({ date }) =>
                bookingsForDate(date).length > 0 ? "has-booking" : ""
              }
              tileContent={({ date }) => (
                <div style={{ fontSize: "0.7rem", marginTop: "2px" }}>
                  {bookingsForDate(date).map((b) => (
                    <div key={b.id} style={{ color: "white" }}>
                      {b.equipment_name}
                    </div>
                  ))}
                </div>
              )}
            />
          </div>

          <div style={{ marginTop: "16px" }}>
            <h3>
              Bookings on {selectedDate.toDateString()} ({bookingsForDate(selectedDate).length})
            </h3>

            {bookingsForDate(selectedDate).length === 0 ? (
              <p>No approved bookings on this date.</p>
            ) : (
              bookingsForDate(selectedDate).map((b) => (
                <IonCard key={b.id}>
                  <IonCardContent>
                    <strong>{b.equipment_name}</strong> <br />
                    {b.start_date} → {b.end_date} <br />
                    <span style={{ color: "green" }}>Approved</span>
                  </IonCardContent>
                </IonCard>
              ))
            )}
          </div>
        </>
      )}

      <style>{`
        .calendar-title {
          text-align: left;
          margin-bottom: 16px;
        }
        .calendar-container {
          display: flex;
          justify-content: left;
        }
        .has-booking {
          background: #62d26f !important;
          color: white;
        
        }
        .react-calendar__tile--active {
          background: #FCB53B !important;
          color: white !important;
       
        }
      `}</style>
    </IonContent>
  );
};

export default Farmer_CalendarView;
