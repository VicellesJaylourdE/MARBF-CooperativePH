import React, { useState } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonButtons,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonToast,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (booking: {
    startDate: string;
    endDate: string;
    location: string;
    quantity: number;
    priceType: "hectare";
  }) => void;
  equipmentName: string;
  price: number;
  equipmentId?: string;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  equipmentName,
  price,
  equipmentId,
}) => {
  const priceType: "hectare" = "hectare"; // fixed
  const [step, setStep] = useState<number>(1);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("gcash");
  const [proofUrl, setProofUrl] = useState<string>("");
  const [gcashRefNo, setGcashRefNo] = useState<string>("");

  const [days, setDays] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>("");

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const computeTotal = (d: number, q: number) => {
    setTotalPrice(d > 0 && q > 0 ? d * price * q : 0);
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    if (endDate) handleEndDateChange(endDate);
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(value);
    if (!startDate || !value) return;

    const start = new Date(startDate);
    const end = new Date(value);

    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diff = end.getTime() - start.getTime();
    const diffDays = diff / (1000 * 60 * 60 * 24) + 1;

    if (diffDays > 0) {
      setDays(diffDays);
      computeTotal(diffDays, quantity);
    } else {
      setDays(0);
      setTotalPrice(0);
      setToastMsg("⚠️ End date must be after start date.");
    }
  };

  const handleQuantityChange = (value: string) => {
    const qty = Number(value) || 0;
    setQuantity(qty);
    computeTotal(days, qty);
  };

  const handleProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileName = `${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("payment_proofs")
        .upload(`payment_proofs/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("payment_proofs")
        .getPublicUrl(`payment_proofs/${fileName}`);

      setProofUrl(data.publicUrl);
      setToastMsg(`Uploaded: ${file.name}`);
    } catch {
      setToastMsg("Failed to upload proof.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate || days <= 0) return alert("Select valid dates.");
    if (!location.trim()) return alert("Enter location.");

    if (paymentMethod === "gcash") {
      if (!proofUrl) return alert("Upload proof of payment.");
      if (!gcashRefNo.trim()) return alert("Enter GCash reference number.");
      if (isNaN(Number(gcashRefNo))) return alert("GCash reference must be numeric.");
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("Login required.");

      const { data: profile } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_email", user.email)
        .single();

      if (!profile) return alert("User record not found.");

      const { data: bookingData } = await supabase
        .from("bookings")
        .insert([
          {
            user_id: profile.user_id,
            equipment_id: equipmentId,
            equipment_name: equipmentName,
            start_date: startDate,
            end_date: endDate,
            location,
            status: "pending",
            total_price: totalPrice,
            quantity,
            price_type: "hectare",
          },
        ])
        .select()
        .single();

      await supabase.from("transactions").insert([
        {
          booking_id: bookingData.id,
          user_id: profile.user_id,
          amount: totalPrice,
          status: "unpaid",
          payment_method: paymentMethod,
          proof_url: proofUrl || null,
          gcash_ref_no: Number(gcashRefNo) || null,
        },
      ]);

      onSubmit({ startDate, endDate, location, quantity, priceType });
      setToastMsg("Booking submitted!");
      onClose();
    } catch {
      setToastMsg("Booking failed.");
    }
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose} backdropDismiss={false}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Book Equipment</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={onClose}>✕</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Reserve “{equipmentName}”</IonCardTitle>
            </IonCardHeader>

            <IonCardContent>
              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <strong>Step {step} of 4</strong>
              </div>

              {step === 1 && (
                <IonGrid>
                  <IonRow>
                    <IonCol>
                      <IonItem>
                        <IonLabel position="stacked">Start Date</IonLabel>
                        <IonInput
                          type="date"
                          value={startDate}
                          onIonInput={(e) => handleStartDateChange(e.detail.value ?? "")}
                        />
                      </IonItem>
                    </IonCol>
                    <IonCol>
                      <IonItem>
                        <IonLabel position="stacked">End Date</IonLabel>
                        <IonInput
                          type="date"
                          value={endDate}
                          onIonInput={(e) => handleEndDateChange(e.detail.value ?? "")}
                        />
                      </IonItem>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              )}

              {step === 2 && (
                <>
                  <IonItem className="ion-margin-top">
                    <IonLabel position="stacked">Hectares (Quantity)</IonLabel>
                    <IonInput
                      type="number"
                      min="1"
                      value={quantity}
                      onIonInput={(e) => handleQuantityChange(e.detail.value ?? "1")}
                    />
                  </IonItem>

                  <IonItem className="ion-margin-top">
                    <IonLabel position="stacked">Location</IonLabel>
                    <IonInput
                      placeholder="Enter location"
                      value={location}
                      onIonInput={(e) => setLocation(e.detail.value ?? "")}
                    />
                  </IonItem>

                  {days > 0 && quantity > 0 && (
                    <IonCard className="ion-margin-top" color="light">
                      <IonCardContent>
                        <p><strong>Computation:</strong></p>
                        <p>Days: {days}</p>
                        <p>Price per hectare: ₱{price}</p>
                        <p>Quantity: {quantity}</p>
                        <hr />
                        <h3><strong>Total:</strong> ₱{totalPrice}</h3>
                      </IonCardContent>
                    </IonCard>
                  )}
                </>
              )}

              {step === 3 && (
                <>
                  <IonItem>
                    <IonLabel position="stacked">Payment Method</IonLabel>
                    <IonSelect
                      value={paymentMethod}
                      onIonChange={(e) => setPaymentMethod(e.detail.value)}
                    >
                      <IonSelectOption value="gcash">GCash</IonSelectOption>
                      <IonSelectOption value="cash">Cash</IonSelectOption>
                    </IonSelect>
                  </IonItem>

                  {paymentMethod === "gcash" && (
                    <>
                      <IonCard className="ion-margin-top">
                        <IonCardHeader>
                          <IonCardTitle>GCash Payment Details</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                          📱 Number: 09639539761 <br /> 👤 Name: Jay Vicelles
                        </IonCardContent>
                      </IonCard>

                      <IonItem className="ion-margin-top">
                        <IonLabel position="stacked">Upload Proof of Payment</IonLabel>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofUpload}
                          disabled={uploading}
                        />
                      </IonItem>

                      <IonItem className="ion-margin-top">
                        <IonLabel position="stacked">GCash Reference Number</IonLabel>
                        <IonInput
                          placeholder="Enter reference number"
                          value={gcashRefNo}
                          onIonInput={(e) => setGcashRefNo(e.detail.value ?? "")}
                        />
                      </IonItem>
                    </>
                  )}

                  {paymentMethod === "cash" && (
                    <>
                      <IonCard className="ion-margin-top">
                        <IonCardHeader>
                          <IonCardTitle>Cash Payment</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                          💵 Please upload proof of cash payment.
                        </IonCardContent>
                      </IonCard>

                      <IonItem className="ion-margin-top">
                        <IonLabel position="stacked">Upload Proof of Payment</IonLabel>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofUpload}
                          disabled={uploading}
                        />
                      </IonItem>
                    </>
                  )}
                </>
              )}

              {step === 4 && (
                <IonCard color="light">
                  <IonCardContent>
                    <p><strong>Equipment:</strong> {equipmentName}</p>
                    <p><strong>Date:</strong> {startDate} - {endDate} ({days} days)</p>
                    <p><strong>Quantity:</strong> {quantity}</p>
                    <p><strong>Location:</strong> {location}</p>
                    <p><strong>Payment:</strong> {paymentMethod}</p>
                    <h3><strong>Total:</strong> ₱{totalPrice}</h3>
                  </IonCardContent>
                </IonCard>
              )}

              <div className="ion-text-end ion-padding-top">
                {step > 1 && <IonButton fill="outline" onClick={prevStep}>Back</IonButton>}
                {step < 4 && <IonButton color="success" onClick={nextStep}>Next</IonButton>}
                {step === 4 && (
                  <IonButton color="success" onClick={handleSubmit} disabled={uploading}>
                    {uploading ? "Uploading..." : "Submit Booking"}
                  </IonButton>
                )}
              </div>
            </IonCardContent>
          </IonCard>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={!!toastMsg}
        message={toastMsg}
        duration={2000}
        onDidDismiss={() => setToastMsg("")}
      />
    </>
  );
};

export default BookingModal;
