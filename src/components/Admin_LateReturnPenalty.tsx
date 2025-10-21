import React, { useEffect, useState } from "react";
import { IonContent, IonSpinner } from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

interface LateReturn {
  id: string;
  booking_id: string;
  user_id: number;
  penalty_amount: number;
  created_at: string;
}

const Admin_LateReturnPenalty: React.FC = () => {
  const [lateReturns, setLateReturns] = useState<LateReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyTotal, setMonthlyTotal] = useState(0);

  useEffect(() => {
    const fetchLateReturns = async () => {
      setLoading(true);
      try {
        const { data: bookings, error: bookingsError } = await supabase
          .from("bookings")
          .select("*")
          .in("status", ["approved", "returned"]);

        if (bookingsError) throw bookingsError;

        const { data: existingLate, error: existingError } = await supabase
          .from("late_returns")
          .select("booking_id");

        if (existingError) throw existingError;

        const existingIds = new Set(existingLate.map((l) => l.booking_id));

        const lateToInsert = bookings
          .filter((booking) => {
            const endDate = new Date(booking.end_date);
            const returnedAt = booking.returned_at ? new Date(booking.returned_at) : null;
            return returnedAt && returnedAt > endDate && !existingIds.has(booking.id);
          })
          .map((b) => ({
            booking_id: b.id,
            user_id: b.user_id,
            penalty_amount: 100,
          }));

        if (lateToInsert.length > 0) {
          await supabase.from("late_returns").insert(lateToInsert);
        }

        const { data, error } = await supabase
          .from("late_returns")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const now = new Date();
        const returnsData = data as LateReturn[];
        setLateReturns(returnsData);

        const total = returnsData
          .filter((item) => {
            const date = new Date(item.created_at);
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
          })
          .reduce((sum, item) => sum + item.penalty_amount, 0);

        setMonthlyTotal(total);
      } catch (err: any) {
        console.error("Error fetching late returns:", err.message);
        setLateReturns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLateReturns();
  }, []);

  return (
    <IonContent className="ion-padding">
      <h2>Late Return Penalty Report</h2>

      {loading ? (
        <div className="flex justify-center items-center mt-5">
          <IonSpinner name="dots" />
        </div>
      ) : (
        <>
          <h3 className="mt-4 font-semibold text-lg">
            Total This Month: <span className="text-blue-600">₱{monthlyTotal.toFixed(2)}</span>
          </h3>

          {lateReturns.length === 0 ? (
            <p className="mt-3 text-gray-500">No late return penalties found.</p>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                  border: "1px solid #000000ff",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#000000ff" }}>
                    <th style={{ border: "1px solid #000000ff", padding: "8px" }}>#</th>
                    <th style={{ border: "1px solid #000000ff", padding: "8px" }}>User ID</th>
                    <th style={{ border: "1px solid #000000ff", padding: "8px" }}>Booking ID</th>
                    <th style={{ border: "1px solid #000000ff", padding: "8px" }}>Penalty (₱)</th>
                    <th style={{ border: "1px solid #000000ff", padding: "8px" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {lateReturns.map((item, index) => (
                    <tr
                      key={item.id}
                      style={{
                        backgroundColor: index % 2 === 0 ? "#000000ff" : "#000000ff",
                      }}
                    >
                      <td style={{ border: "1px solid #080808ff", padding: "8px" }}>{index + 1}</td>
                      <td style={{ border: "1px solid #000000ff", padding: "8px" }}>{item.user_id}</td>
                      <td style={{ border: "1px solid #000000ff", padding: "8px" }}>{item.booking_id}</td>
                      <td style={{ border: "1px solid #000000ff", padding: "8px" }}>
                        ₱{item.penalty_amount.toFixed(2)}
                      </td>
                      <td style={{ border: "1px solid #0e0d0dff", padding: "8px" }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </IonContent>
  );
};

export default Admin_LateReturnPenalty;
