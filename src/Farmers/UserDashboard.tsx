import {
  IonPage,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
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
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setToastMsg("Please log in to view your bookings.");
        setBookings([]);
        return;
      }

      const { data: userData, error: userTableError } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_email", user.email)
        .single();

      if (userTableError || !userData) {
        throw new Error("No matching user record found.");
      }

      const { data, error } = await supabase
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

      if (error) throw error;

      setBookings(data || []);
    } catch (err: any) {
      console.error("Error loading bookings:", err.message);
      setToastMsg("Failed to load bookings.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (segment === "bookings") {
      fetchBookings();
    }
  }, [segment]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "SIGNED_IN") {
          fetchBookings();
        }
      }
    );
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === "granted") {
        PushNotifications.register();
      }
    });

    PushNotifications.addListener("registration", (token) => {
      console.log("Push registration success, token:", token.value);
    });

    PushNotifications.addListener("registrationError", (error) => {
      console.error("Push registration error:", error);
    });

    PushNotifications.addListener(
      "pushNotificationReceived",
      (notification) => {
        alert(`📢 New Notification: ${notification.title}\n${notification.body}`);
      }
    );
  }, []);

  return (
    <IonPage>
      <HeaderBar />
      <IonContent fullscreen>
        <IonSegment
          value={segment}
          onIonChange={(e) => setSegment(String(e.detail.value))}
        >
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
              <p className="ion-text-center ion-padding">📖 No bookings found yet.</p>
            ) : (
              <IonList>
                {bookings.map((b) => {
                  const transaction = b.transactions?.[0]; // assume 1 transaction per booking

                  const canReturn = (() => {
                    const now = new Date();
                    const endDate = new Date(b.end_date);

                    if (now > endDate) return true;

                    if (
                      now.toDateString() === endDate.toDateString() &&
                      now.getHours() >= 12
                    ) {
                      return true;
                    }

                    return false;
                  })() && b.status !== "returned";

                  return (
                    <IonCard key={b.id}>
                      <IonCardHeader>
                        <IonCardTitle>{b.equipment_name}</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        <IonItem>
                          <IonLabel>
                            <strong>Start:</strong> {b.start_date}
                          </IonLabel>
                        </IonItem>
                        <IonItem>
                          <IonLabel>
                            <strong>End:</strong> {b.end_date}
                          </IonLabel>
                        </IonItem>
                        <IonItem>
                          <IonLabel>
                            <strong>Location:</strong> {b.location || "N/A"}
                          </IonLabel>
                        </IonItem>
                        <IonItem>
                          <IonLabel>
                            <strong>Total:</strong> ₱{transaction?.amount || b.total_price || 0}
                          </IonLabel>
                        </IonItem>
                        <IonItem>
                          <IonLabel>
                            <strong>Booking Status:</strong>{" "}
                            <span
                              style={{
                                color:
                                  b.status === "approved"
                                    ? "green"
                                    : b.status === "declined"
                                    ? "red"
                                    : b.status === "pending"
                                    ? "orange"
                                    : b.status === "returned"
                                    ? "blue"
                                    : "gray",
                                fontWeight: "bold",
                              }}
                            >
                              {b.status.toUpperCase()}
                            </span>
                          </IonLabel>
                        </IonItem>

                        {transaction && (
                          <>
                            <IonItem>
                              <IonLabel>
                                <strong>Payment Status:</strong>{" "}
                                <span
                                  style={{
                                    color:
                                      transaction.status === "paid"
                                        ? "green"
                                        : transaction.status === "unpaid"
                                        ? "orange"
                                        : "red",
                                    fontWeight: "bold",
                                  }}
                                >
                                  {transaction.status.toUpperCase()}
                                </span>
                              </IonLabel>
                            </IonItem>
                            <IonItem>
                              <IonLabel>
                                <strong>Payment Method:</strong>{" "}
                                {transaction.payment_method.toUpperCase()}
                              </IonLabel>
                            </IonItem>
                            {transaction.gcash_ref_no && (
                              <IonItem>
                                <IonLabel>
                                  <strong>GCash Ref #:</strong> {transaction.gcash_ref_no}
                                </IonLabel>
                              </IonItem>
                            )}
                            {transaction.proof_url && (
                              <IonItem>
                                <IonLabel>
                                  <strong>Proof:</strong>{" "}
                                  <a href={transaction.proof_url} target="_blank" rel="noopener noreferrer">
                                    View
                                  </a>
                                </IonLabel>
                              </IonItem>
                            )}
                            {transaction.paid_at && (
                              <IonItem>
                                <IonLabel>
                                  <strong>Paid At:</strong>{" "}
                                  {new Date(transaction.paid_at).toLocaleString()}
                                </IonLabel>
                              </IonItem>
                            )}
                            <IonItem>
                              <IonLabel>
                                <strong>Quantity:</strong> {transaction.quantity} {transaction.price_type}
                              </IonLabel>
                            </IonItem>
                          </>
                        )}

                        {b.notes && (
                          <IonItem>
                            <IonLabel>
                              <strong>Notes:</strong> {b.notes}
                            </IonLabel>
                          </IonItem>
                        )}

                        {b.status === "pending" && (
                          <IonItem lines="none" className="ion-padding-top">
                            <IonButton
                              color="danger"
                              onClick={async () => {
                                const confirmCancel = window.confirm(
                                  "Are you sure you want to cancel this booking?"
                                );
                                if (!confirmCancel) return;

                                try {
                                  const { error } = await supabase
                                    .from("bookings")
                                    .update({ status: "cancelled" })
                                    .eq("id", b.id);

                                  if (error) throw error;

                                  setBookings((prev) =>
                                    prev.map((item) =>
                                      item.id === b.id
                                        ? { ...item, status: "cancelled" }
                                        : item
                                    )
                                  );
                                  setToastMsg("Booking successfully cancelled!");
                                } catch (err: any) {
                                  console.error("Cancel booking error:", err.message);
                                  setToastMsg("Failed to cancel booking. Try again.");
                                }
                              }}
                            >
                              Cancel Booking
                            </IonButton>
                          </IonItem>
                        )}

                        {canReturn && transaction?.status === "paid" && (
                          <IonItem lines="none" className="ion-padding-top">
                            <IonButton
                              color="warning"
                              onClick={async () => {
                                try {
                                  const { error } = await supabase
                                    .from("bookings")
                                    .update({ status: "returned" })
                                    .eq("id", b.id);

                                  if (error) throw error;

                                  setBookings((prev) =>
                                    prev.map((item) =>
                                      item.id === b.id
                                        ? { ...item, status: "returned" }
                                        : item
                                    )
                                  );
                                  setToastMsg("Booking successfully returned!");
                                } catch (err: any) {
                                  console.error("Return booking error:", err.message);
                                  setToastMsg("Failed to return booking. Try again.");
                                }
                              }}
                            >
                              Mark as Returned
                            </IonButton>
                          </IonItem>
                        )}
                      </IonCardContent>
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
