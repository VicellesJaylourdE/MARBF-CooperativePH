import {
  IonPage,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonCard,
  IonSpinner,
  IonToast,
  IonButton,
} from "@ionic/react";
import { useState, useEffect } from "react";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "../utils/supabaseClient";
import HeaderBar from "../components/Farmer_HeaderBar";
import EquipmentCatalog from "../components/Farmer_EquipmentCatalog";
import CalendarView from "../components/Farmer_CalendarView";
import "../theme/UserDashboard.css";

const UserDashboard: React.FC = () => {
  const [segment, setSegment] = useState("catalog");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return setBookings([]);

      const { data: userData } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_email", user.email)
        .single();

      if (!userData) return setBookings([]);

      const { data } = await supabase
        .from("bookings")
        .select(`
          *,
          transactions (
            amount,
            status,
            payment_method,
            proof_url,
            gcash_ref_no,
            quantity,
            price_type,
            paid_at
          )
        `)
        .eq("user_id", userData.user_id)
        .order("created_at", { ascending: false });

      setBookings(data || []);
    } catch (err) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (segment === "bookings") fetchBookings();
  }, [segment]);

  useEffect(() => {
    PushNotifications.requestPermissions().then((res) => {
      if (res.receive === "granted") PushNotifications.register();
    });
  }, []);

  return (
    <IonPage>
      <HeaderBar />
      <IonContent fullscreen>
        <IonSegment value={segment} onIonChange={(e) => setSegment(String(e.detail.value))}>
          <IonSegmentButton value="catalog">
            <IonLabel>Equipment Catalog</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="bookings">
            <IonLabel>My Bookings</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="calendar">
            <IonLabel>Calendar</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {segment === "catalog" && <EquipmentCatalog />}

        {segment === "bookings" && (
          <>
            {loading ? (
              <div className="ion-text-center ion-padding">
                <IonSpinner name="crescent" />
              </div>
            ) : bookings.length === 0 ? (
              <p className="ion-text-center ion-padding">📖 No bookings yet.</p>
            ) : (
              <IonList>
                {bookings.map((b) => {
                  const transaction = b.transactions?.[0];

                  const canReturn = (() => {
                    const now = new Date();
                    const end = new Date(b.end_date);
                  
                    return (b.status === "in_use" && (now > end || (now.toDateString() === end.toDateString() && now.getHours() >= 12))) && b.status !== "returned";
                  })();

                  const getStatusColor = (status: string) => {
                   
                    if (status === "in_use") return "#ff6a00ff"; 
                    if (status === "approved") return "green";
                    if (status === "pending") return "orange";
                    if (status === "declined") return "red";
                    if (status === "returned") return "blue";
                    return "gray";
                  };

                  const getPaymentColor = (status: string) => {
                    if (status === "paid") return "green";
                    if (status === "unpaid") return "orange";
                    return "red";
                  };

                  return (
                    <IonCard key={b.id} className="receipt-card">
                      <div className="receipt-header">{b.equipment_name}</div>

                      <div className="receipt-row">
                        <span className="receipt-label">Start:</span>
                        <span>{b.start_date}</span>
                      </div>

                      <div className="receipt-row">
                        <span className="receipt-label">End:</span>
                        <span>{b.end_date}</span>
                      </div>

                      <div className="receipt-row">
                        <span className="receipt-label">Location:</span>
                        <span>{b.location || "N/A"}</span>
                      </div>

                      <div className="receipt-row">
                        <span className="receipt-label">Status:</span>
                        <span style={{ color: getStatusColor(b.status), fontWeight: 'bold' }}>
                            {b.status.toUpperCase().replace('_', ' ')}
                        </span>
                      </div>

                      {transaction && (
                        <>
                          <div className="receipt-row">
                            <span className="receipt-label">Payment:</span>
                            <span style={{ color: getPaymentColor(transaction.status), fontWeight: 'bold' }}>
                              {transaction.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="receipt-row">
                            <span className="receipt-label">Method:</span>
                            <span>{transaction.payment_method.toUpperCase()}</span>
                          </div>

                          {transaction.gcash_ref_no && (
                            <div className="receipt-row">
                              <span className="receipt-label">GCash Ref #:</span>
                              <span>{transaction.gcash_ref_no}</span>
                            </div>
                          )}

                          {transaction.proof_url && (
                            <div className="receipt-row">
                              <span className="receipt-label">Proof:</span>
                              <a
                                href={transaction.proof_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ textDecoration: "underline" }}
                              >
                                View
                              </a>
                            </div>
                          )}

                          {transaction.paid_at && (
                            <div className="receipt-row">
                              <span className="receipt-label">Paid At:</span>
                              <span>{new Date(transaction.paid_at).toLocaleString()}</span>
                            </div>
                          )}
                        </>
                      )}

                      <div className="receipt-total">
                        Total: ₱{transaction?.amount || b.total_price || 0}
                      </div>

                    
                      {b.status === "pending" && (
                        <IonButton
                          color="danger"
                          className="ion-margin-top"
                          style={{ marginRight: "auto", width: "fit-content" }}
                          onClick={async () => {
                            if (!window.confirm("Cancel this booking?")) return;
                       
                            await supabase.from("bookings").update({ status: "cancelled" }).eq("id", b.id);
                            if (transaction && transaction.status === "unpaid") {
                                await supabase.from("transactions").update({ status: "cancelled" }).eq("booking_id", b.id);
                            }
                            fetchBookings();
                          }}
                        >
                          Cancel Booking
                        </IonButton>
                      )}

                     
                      {canReturn && b.status === "in_use" && transaction?.status === "paid" && (
                        <IonButton
                          color="warning"
                          className="ion-margin-top"
                          style={{ marginRight: "auto", width: "fit-content" }}
                          onClick={async () => {
                            if (!window.confirm("Confirm equipment has been returned?")) return;
                            await supabase.from("bookings").update({ status: "returned" }).eq("id", b.id);
                            fetchBookings();
                          }}
                        >
                          Mark as Returned
                        </IonButton>
                      )}
                    </IonCard>
                  );
                })}
              </IonList>
            )}
          </>
        )}

        {segment === "calendar" && <CalendarView />}

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={2000}
          onDidDismiss={() => setToastMsg("")}
        />
      </IonContent>
    </IonPage>
  );
};

export default UserDashboard;