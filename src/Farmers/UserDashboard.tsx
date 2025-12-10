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
  IonInput,
  IonAlert,
  IonGrid,
  IonRow,
  IonCol,
  IonAvatar,
  IonImg,
  IonText,
  IonInputPasswordToggle,
  IonListHeader,
} from "@ionic/react";
import { useState, useEffect, useRef } from "react";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "../utils/supabaseClient";
import HeaderBar from "../components/Farmer_HeaderBar";
import EquipmentCatalog from "../components/Farmer_EquipmentCatalog";
import CalendarView from "../components/Farmer_CalendarView";
import { useHistory } from "react-router-dom";
import "../theme/UserDashboard.css";

// ⚠️ PAHINUMDOM: Ang CSS styles ania sa ubos aron masigurado nga ang 'receipt-row' mo-work.
// Mas maayo kung ibalhin nimo kini sa ../theme/UserDashboard.css
const styles = `
.small-segment-tabs {
  margin-top: 5px;
  --background: var(--ion-color-light);
}

.receipt-card {
  padding: 15px;
  margin: 10px;
  border-radius: 10px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.receipt-header {
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
  color: var(--ion-color-primary, #3880ff);
  border-bottom: 1px solid var(--ion-color-light);
  padding-bottom: 5px;
}

/* ✨ CSS para DILI maglagyo ang text (Flexbox) */
.receipt-row {
  display: flex; /* Gihimo siyang flex container */
  justify-content: space-between; /* Gi-align ang label sa left ug value sa right */
  align-items: center; 
  padding: 4px 0; 
  border-bottom: 1px dotted var(--ion-color-step-150, #d7d7d7); 
}

.receipt-label {
  font-weight: 500;
  color: var(--ion-color-medium, #929a9c); 
  flex-shrink: 0; 
  padding-right: 10px; 
}

.receipt-total {
  text-align: right;
  font-size: 1.3em;
  font-weight: bold;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 2px solid var(--ion-color-dark);
}
`;


const UserDashboard: React.FC = () => {
  const [segment, setSegment] = useState("catalog");

  const [bookingSubSegment, setBookingSubSegment] = useState("history");

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const [profileLoading, setProfileLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [originalPhone, setOriginalPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const history = useHistory();


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
        .select(
          `
          *,
          transactions (
            amount, status, payment_method, proof_url, 
            gcash_ref_no, quantity, price_type, paid_at
          )
        `
        )
        .eq("user_id", userData.user_id)
        .order("created_at", { ascending: false });

      setBookings(data || []);
    } catch (err) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "in_use") return "#ff6a00ff";
    if (status === "approved") return "green";
    if (status === "pending") return "orange";
    if (status === "declined") return "red";
    if (status === "returned") return "blue";
    if (status === "cancelled") return "gray"; // Gidugang ang 'cancelled'
    return "gray";
  };

  const getPaymentColor = (status: string) => {
    if (status === "paid") return "green";
    if (status === "unpaid") return "orange";
    if (status === "cancelled") return "red";
    return "red";
  };

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session || !session.user) {
        setAlertMessage("You must be logged in to access this page.");
        setShowAlert(true);
        history.push("/login");
        return;
      }

      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_email", session.user.email)
        .single();

      if (error || !userData) {
        setAlertMessage("User profile not found.");
        setShowAlert(true);
        return;
      }

      setEmail(userData.user_email || "");
      setUsername(userData.username || "");
      setFirstName(userData.user_firstname || "");
      setLastName(userData.user_lastname || "");
      setPhone(userData.user_phone || "");
      setOriginalPhone(userData.user_phone || "");
      setAvatarPreview(userData.user_avatar_url || null);
    } catch (err: any) {
      setAlertMessage("Error loading profile: " + err.message);
      setShowAlert(true);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (!currentPassword) {
        setAlertMessage("Please enter your current password to confirm changes.");
        setShowAlert(true);
        return;
      }

      const { data: session } = await supabase.auth.getSession();
      const user = session?.session?.user;
      if (!user) return;

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      });

      if (signInError) {
        setAlertMessage("Incorrect current password.");
        setShowAlert(true);
        return;
      }

      if (phone && phone !== originalPhone) {
        const { data: existingUser } = await supabase
          .from("users")
          .select("user_id")
          .eq("user_phone", phone)
          .neq("user_email", email)
          .single();

        if (existingUser) {
          setAlertMessage("This phone number is already in use by another account.");
          setShowAlert(true);
          return;
        }
      }

      let avatarUrl = avatarPreview;
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("user-avatars")
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
          setAlertMessage(`Avatar upload failed: ${uploadError.message}`);
          setShowAlert(true);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("user-avatars")
          .getPublicUrl(filePath);
        avatarUrl = publicUrlData.publicUrl;
      }

      const updateData: any = {
        username,
        user_firstname: firstName,
        user_lastname: lastName,
        user_avatar_url: avatarUrl,
      };

      if (phone !== originalPhone) {
        updateData.user_phone = phone;
      }

      const { error: updateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("user_email", user.email);

      if (updateError) {
        setAlertMessage(`Update failed: ${updateError.message}`);
        setShowAlert(true);
        return;
      }

      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setAlertMessage("New passwords do not match.");
          setShowAlert(true);
          return;
        }

        const { error: pwError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (pwError) {
          setAlertMessage(`Password update failed: ${pwError.message}`);
          setShowAlert(true);
          return;
        }
      }

      setOriginalPhone(phone);
      setAlertMessage("✅ Profile updated successfully!");
      setShowAlert(true);
    } catch (error: any) {
      setAlertMessage("Error: " + error.message);
      setShowAlert(true);
    }
  };


  useEffect(() => {
    if (segment === "bookings") {
      fetchBookings();
    }
    if (segment === "profile") {
      fetchProfile();
    }
  }, [segment, history]);

  useEffect(() => {
    PushNotifications.requestPermissions().then((res) => {
      if (res.receive === "granted") PushNotifications.register();
    });
  }, []);

  return (
    <IonPage>
      {/* ⚠️ EMBEDDED STYLE: Ibalhin kini sa CSS file kung dili nimo gusto ania ra. */}
      <style>{styles}</style>
      <HeaderBar />
      <IonContent fullscreen>
        <IonSegment
          value={segment}
          onIonChange={(e) => setSegment(String(e.detail.value))}
          className="small-segment-tabs"
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
          <IonSegmentButton value="profile">
            <IonLabel>My Profile</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {segment === "catalog" && <EquipmentCatalog />}

        {segment === "calendar" && <CalendarView />}


        {/* 📑 MY BOOKINGS (Karon naay Sub-Segments) */}
        {segment === "bookings" && (
          <>
            {/* ⬅️ Bag-ong Sub-Segments dinhi */}
            <IonSegment
              value={bookingSubSegment}
              onIonChange={(e) =>
                setBookingSubSegment(String(e.detail.value))
              }
              className="small-segment-tabs"
            >
              <IonSegmentButton value="history">
                <IonLabel>History (Active/Current)</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="transaction">
                <IonLabel>Transaction (Archive/Completed)</IonLabel>
              </IonSegmentButton>
            </IonSegment>
            {/* ⬅️ End sa Bag-ong Sub-Segments */}

            {loading ? (
              <div className="ion-text-center ion-padding">
                <IonSpinner name="crescent" />
              </div>
            ) : bookings.length === 0 ? (
              <p className="ion-text-center ion-padding">
                📖 No bookings yet.
              </p>
            ) : (
              <IonList>
                {/* ⬅️ Filtering logic base sa sub-segment */}
                {bookings
                  .filter((b) => {
                    const status = b.status;
                    if (bookingSubSegment === "history") {
                      // History (Active/Current): Pending, Approved, In Use.
                      return (
                        status === "pending" ||
                        status === "approved" ||
                        status === "in_use"
                      );
                    } else if (bookingSubSegment === "transaction") {
                      // Transaction (Archive/Completed): Returned, Cancelled, Declined.
                      return (
                        status === "returned" ||
                        status === "cancelled" ||
                        status === "declined" // Gidugang ang Declined sa Archive
                      );
                    }
                    return false;
                  })
                  .map((b) => {
                    const transaction = b.transactions?.[0];
                    // Logic para sa Return button (dili mausab)
                    const canReturn = (() => {
                      const now = new Date();
                      const end = new Date(b.end_date);
                      return (
                        b.status === "in_use" &&
                        (now > end ||
                          (now.toDateString() === end.toDateString() &&
                            now.getHours() >= 12)) &&
                        b.status !== "returned"
                      );
                    })();

                    return (
                      // 🌟 KINI ANG RECEIPT CARD NGA GI-EDIT ANG STYLE 🌟
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
                          <span
                            style={{
                              color: getStatusColor(b.status),
                              fontWeight: "bold",
                            }}
                          >
                            {b.status.toUpperCase().replace("_", " ")}
                          </span>
                        </div>
                        {transaction && (
                          <>
                            <div className="receipt-row">
                              <span className="receipt-label">Payment:</span>
                              <span
                                style={{
                                  color: getPaymentColor(transaction.status),
                                  fontWeight: "bold",
                                }}
                              >
                                {transaction.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="receipt-row">
                              <span className="receipt-label">Method:</span>
                              <span>
                                {transaction.payment_method.toUpperCase()}
                              </span>
                            </div>
                            {transaction.gcash_ref_no && (
                              <div className="receipt-row">
                                <span className="receipt-label">
                                  GCash Ref #:
                                </span>
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
                                <span>
                                  {new Date(
                                    transaction.paid_at
                                  ).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                        <div className="receipt-total">
                          Total: ₱{transaction?.amount || b.total_price || 0}
                        </div>
                        {/* ⬅️ Action buttons ra ni sa 'history' segment */}
                        {bookingSubSegment === "history" && (
                          <>
                            {b.status === "pending" && (
                              <IonButton
                                color="danger"
                                className="ion-margin-top"
                                style={{
                                  marginRight: "auto",
                                  width: "fit-content",
                                }}
                                onClick={async () => {
                                  if (!window.confirm("Cancel this booking?"))
                                    return;
                                  await supabase
                                    .from("bookings")
                                    .update({ status: "cancelled" })
                                    .eq("id", b.id);
                                  if (
                                    transaction &&
                                    transaction.status === "unpaid"
                                  ) {
                                    await supabase
                                      .from("transactions")
                                      .update({ status: "cancelled" })
                                      .eq("booking_id", b.id);
                                  }
                                  fetchBookings();
                                }}
                              >
                                Cancel Booking
                              </IonButton>
                            )}
                            {canReturn &&
                              b.status === "in_use" &&
                              transaction?.status === "paid" && (
                                <IonButton
                                  color="warning"
                                  className="ion-margin-top"
                                  style={{
                                    marginRight: "auto",
                                    width: "fit-content",
                                  }}
                                  onClick={async () => {
                                    if (
                                      !window.confirm(
                                        "Confirm equipment has been returned?"
                                      )
                                    )
                                      return;
                                    await supabase
                                      .from("bookings")
                                      .update({ status: "returned" })
                                      .eq("id", b.id);
                                    fetchBookings();
                                  }}
                                >
                                  Mark as Returned
                                </IonButton>
                              )}
                          </>
                        )}
                      </IonCard>
                    );
                  })}
              </IonList>
            )}
          </>
        )}
        {segment === "profile" && (
          <>
            {profileLoading ? (
              <div className="ion-text-center ion-padding">
                <IonSpinner name="crescent" />
                <p>Loading profile...</p>
              </div>
            ) : (
              <div className="ion-padding">
                <IonText>
                  <h1 style={{ marginBottom: "20px" }}>My Profile</h1>
                </IonText>

                <IonGrid style={{ paddingTop: "0" }}>
                  {/* 🍎 Avatar Section */}
                  <IonRow className="ion-justify-content-center ion-margin-bottom">
                    <IonCol size="12" className="ion-text-center">
                      {avatarPreview && (
                        <IonAvatar
                          style={{
                            width: "150px",
                            height: "150px",
                            margin: "10px auto 15px auto",
                          }}
                        >
                          <IonImg
                            src={avatarPreview}
                            style={{ objectFit: "cover" }}
                          />
                        </IonAvatar>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                      <IonButton
                        expand="block"
                        fill="outline"
                        color="warning"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change Avatar
                      </IonButton>
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol>
                      <hr
                        style={{
                          borderTop:
                            "1px solid var(--ion-color-step-150, #d7d7d7)",
                          margin: "20px 0",
                        }}
                      />
                    </IonCol>
                  </IonRow>

                  {/* 📝 Profile Info Section */}
                  <IonRow>
                    <IonCol size="12">
                      <IonListHeader
                        color="light"
                        style={{ paddingLeft: "0", marginBottom: "10px" }}
                      >
                        <IonText>
                          <h3 style={{ margin: "0" }}>
                            Personal Information
                          </h3>
                        </IonText>
                      </IonListHeader>
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol size="12" style={{ marginBottom: "15px" }}>
                      <IonInput
                        label="Username"
                        fill="outline"
                        labelPlacement="floating"
                        value={username}
                        onIonChange={(e) => setUsername(e.detail.value!)}
                      />
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol size="6" style={{ marginBottom: "15px" }}>
                      <IonInput
                        label="First Name"
                        fill="outline"
                        labelPlacement="floating"
                        value={firstName}
                        onIonChange={(e) => setFirstName(e.detail.value!)}
                      />
                    </IonCol>
                    <IonCol size="6" style={{ marginBottom: "15px" }}>
                      <IonInput
                        label="Last Name"
                        fill="outline"
                        labelPlacement="floating"
                        value={lastName}
                        onIonChange={(e) => setLastName(e.detail.value!)}
                      />
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol size="12" style={{ marginBottom: "15px" }}>
                      <IonInput
                        label="Phone Number"
                        fill="outline"
                        labelPlacement="floating"
                        value={phone}
                        onIonChange={(e) => setPhone(e.detail.value!)}
                      />
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol size="12" style={{ marginBottom: "15px" }}>
                      <IonInput
                        label="Email"
                        fill="outline"
                        labelPlacement="floating"
                        readonly
                        value={email}
                      />
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol>
                      <hr
                        style={{
                          borderTop:
                            "1px solid var(--ion-color-step-150, #d7d7d7)",
                          margin: "20px 0",
                        }}
                      />
                    </IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol size="12">
                      <IonListHeader
                        color="light"
                        style={{ paddingLeft: "0", marginBottom: "10px" }}
                      >
                        <IonText>
                          <h3 style={{ margin: "0" }}>Change Password</h3>
                        </IonText>
                      </IonListHeader>
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol size="12" style={{ marginBottom: "15px" }}>
                      <IonInput
                        label="New Password"
                        type="password"
                        fill="outline"
                        labelPlacement="floating"
                        value={newPassword}
                        onIonChange={(e) => setNewPassword(e.detail.value!)}
                      >
                        <IonInputPasswordToggle slot="end" />
                      </IonInput>
                    </IonCol>
                    <IonCol size="12" style={{ marginBottom: "15px" }}>
                      <IonInput
                        label="Confirm New Password"
                        type="password"
                        fill="outline"
                        labelPlacement="floating"
                        value={confirmPassword}
                        onIonChange={(e) => setConfirmPassword(e.detail.value!)}
                      >
                        <IonInputPasswordToggle slot="end" />
                      </IonInput>
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol>
                      <hr
                        style={{
                          borderTop:
                            "1px solid var(--ion-color-step-1pre0, #d7d7d7)",
                          margin: "20px 0",
                        }}
                      />
                    </IonCol>
                  </IonRow>

                  {/* 🔒 Confirm Section */}
                  <IonRow>
                    <IonCol size="12">
                      <IonListHeader
                        color="light"
                        style={{ paddingLeft: "0", marginBottom: "10px" }}
                      >
                        <IonText>
                          <h3 style={{ margin: "0" }}>
                            Confirm Changes (Required)
                          </h3>
                        </IonText>
                      </IonListHeader>
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol style={{ marginBottom: "20px" }}>
                      <IonInput
                        label="Current Password"
                        type="password"
                        fill="outline"
                        labelPlacement="floating"
                        value={currentPassword}
                        onIonChange={(e) => setCurrentPassword(e.detail.value!)}
                      >
                        <IonInputPasswordToggle slot="end" />
                      </IonInput>
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol>
                      <IonButton
                        expand="full"
                        shape="round"
                        color="warning"
                        onClick={handleUpdateProfile}
                        style={{ marginTop: "10px" }}
                      >
                        Save Changes
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </div>
            )}
          </>
        )}
        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={2000}
          onDidDismiss={() => setToastMsg("")}
        />
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          message={alertMessage}
          buttons={["OK"]}
        />
      </IonContent>
    </IonPage>
  );
};

export default UserDashboard;