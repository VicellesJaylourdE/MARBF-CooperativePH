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
    notes: string;
    location: string;
    quantity: number;
    priceType: "hectare" | "kilo";
  }) => void;
  equipmentName: string;
  price: number;
  priceType?: "hectare" | "kilo";
  equipmentId?: string;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  equipmentName,
  price,
  priceType = "hectare",
  equipmentId,
}) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("gcash");
  const [proofUrl, setProofUrl] = useState<string>(""); // <- store URL now
  const [uploading, setUploading] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>("");

  const [days, setDays] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const computeTotal = (d: number, q: number) => {
    const total =
      priceType === "hectare"
        ? d > 0 && q > 0
          ? d * price * q
          : 0
        : d > 0 && q > 0
        ? price * q * d
        : q > 0
        ? price * q
        : 0;
    setTotalPrice(total);
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

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from("payment_proofs")
        .upload(`payment_proofs/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("payment_proofs")
        .getPublicUrl(`payment_proofs/${fileName}`);

      setProofUrl(data.publicUrl);
      setToastMsg(`Uploaded: ${file.name}`);
    } catch (err: any) {
      console.error("Upload error:", err.message);
      setToastMsg("Failed to upload proof. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate || days <= 0) {
      alert("Please select valid start and end dates.");
      return;
    }

    if (!location || location.trim() === "") {
      alert("⚠️ Please enter a location.");
      return;
    }

    if (paymentMethod === "gcash" && !proofUrl) {
      alert("⚠️ Please upload proof of GCash payment.");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in to book equipment.");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_email", user.email)
        .single();

      if (!profile) {
        alert("User record not found.");
        return;
      }

      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert([
          {
            user_id: profile.user_id,
            equipment_id: equipmentId,
            equipment_name: equipmentName,
            start_date: startDate,
            end_date: endDate,
            notes,
            location,
            status: "pending",
            total_price: totalPrice,
            quantity,
            price_type: priceType,
          },
        ])
        .select()
        .single();

      if (bookingError) throw bookingError;

      const { error: transactionError } = await supabase
        .from("transactions")
        .insert([
          {
            booking_id: bookingData.id,
            user_id: profile.user_id,
            amount: totalPrice,
            status: "unpaid",
            payment_method: paymentMethod,
            proof_url: proofUrl || null,
          },
        ]);

      if (transactionError) throw transactionError;

      onSubmit({ startDate, endDate, notes, location, quantity, priceType });
      setToastMsg("Booking submitted successfully!");
      onClose();
    } catch (err: any) {
      console.error("Booking error:", err.message);
      setToastMsg("Failed to submit booking. Try again.");
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
              <IonGrid>
                <IonRow>
                  <IonCol>
                    <IonItem>
                      <IonLabel position="stacked">Start Date</IonLabel>
                      <IonInput
                        type="date"
                        value={startDate}
                        onIonInput={(e) =>
                          handleStartDateChange(e.detail.value ?? "")
                        }
                      />
                    </IonItem>
                  </IonCol>
                  <IonCol>
                    <IonItem>
                      <IonLabel position="stacked">End Date</IonLabel>
                      <IonInput
                        type="date"
                        value={endDate}
                        onIonInput={(e) =>
                          handleEndDateChange(e.detail.value ?? "")
                        }
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>

              <IonItem className="ion-margin-top">
                <IonLabel position="stacked">
                  {priceType === "hectare" ? "Hectares" : "Kilos"} (Quantity)
                </IonLabel>
                <IonInput
                  type="number"
                  min="1"
                  value={quantity}
                  onIonInput={(e) => handleQuantityChange(e.detail.value ?? "1")}
                />
              </IonItem>

              {startDate && endDate && (
                <>
                  {priceType === "hectare" && (
                    <IonItem>
                      <IonLabel>
                        ✅ <strong>Days:</strong> {days}
                      </IonLabel>
                    </IonItem>
                  )}

                  <IonItem>
                    <IonLabel>
                      💰 <strong>Price per {priceType}:</strong> ₱{price}
                    </IonLabel>
                  </IonItem>

                  <IonItem>
                    <IonLabel>
                      <strong>Total:</strong> ₱{totalPrice}
                    </IonLabel>
                  </IonItem>
                </>
              )}

              <IonItem>
                <IonLabel position="stacked">Location</IonLabel>
                <IonInput
                  placeholder="Enter location"
                  value={location}
                  onIonInput={(e) => setLocation(e.detail.value ?? "")}
                />
              </IonItem>

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
                      <p>
                        📱 <strong>Number:</strong> 09639539761 <br />
                        👤 <strong>Name:</strong> Jay Vicelles
                      </p>
                    </IonCardContent>
                  </IonCard>

                  <IonItem>
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

              <div className="ion-text-end ion-padding-top">
                <IonButton fill="clear" onClick={onClose}>
                  Cancel
                </IonButton>
                <IonButton
                  color="success"
                  onClick={handleSubmit}
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Submit Booking"}
                </IonButton>
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
