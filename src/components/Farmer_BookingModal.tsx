import React, { useState } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonTextarea,
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
import { supabase } from "../utils/supabaseClient"; // 👈 keep this

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (booking: {
    startDate: string;
    endDate: string;
    notes: string;
    location: string;
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
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("gcash");
  const [proofFileName, setProofFileName] = useState<string>(""); // filename only
  const [uploading, setUploading] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>("");

  const days =
    startDate && endDate
      ? (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24) +
        1
      : 0;
  const totalPrice = days > 0 ? days * price : 0;

  // ✅ Handle proof upload (store only file name)
  const handleProofUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const fileName = `${Date.now()}_${file.name}`;

      // ✅ Upload inside 'payment_proofs/' folder
      const { error } = await supabase.storage
        .from("payment_proofs")
        .upload(`payment_proofs/${fileName}`, file);

      if (error) throw error;

      setProofFileName(file.name); // ✅ show only name
      setToastMsg(`Uploaded: ${file.name}`);
    } catch (err: any) {
      console.error("Upload error:", err.message);
      setToastMsg("Failed to upload proof. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      alert("Please select start and end dates.");
      return;
    }

    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("You must be logged in to book equipment.");
        return;
      }

      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert([
          {
            user_id: user.id,
            equipment_id: equipmentId,
            equipment_name: equipmentName,
            start_date: startDate,
            end_date: endDate,
            notes,
            location,
            status: "pending",
            total_price: totalPrice,
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
            user_id: user.id,
            amount: totalPrice,
            status: "unpaid",
            payment_method: paymentMethod,
            proof_url: proofFileName || null,
          },
        ]);

      if (transactionError) throw transactionError;

      onSubmit({ startDate, endDate, notes, location });
      setToastMsg("Booking submitted successfully!");
      setStartDate("");
      setEndDate("");
      setNotes("");
      setLocation("");
      setPaymentMethod("gcash");
      setProofFileName("");
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
                        onIonInput={(e) => setStartDate(e.detail.value ?? "")}
                      />
                    </IonItem>
                  </IonCol>
                  <IonCol>
                    <IonItem>
                      <IonLabel position="stacked">End Date</IonLabel>
                      <IonInput
                        type="date"
                        value={endDate}
                        onIonInput={(e) => setEndDate(e.detail.value ?? "")}
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>

              <IonItem>
                <IonLabel position="stacked">Location</IonLabel>
                <IonInput
                  placeholder="Enter location or pickup point"
                  value={location}
                  onIonInput={(e) => setLocation(e.detail.value ?? "")}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Payment Method</IonLabel>
                <IonSelect
                  placeholder="Select payment method"
                  value={paymentMethod}
                  onIonChange={(e) => setPaymentMethod(e.detail.value)}
                >
                  <IonSelectOption value="gcash">Gcash</IonSelectOption>
                  <IonSelectOption value="cash">Cash</IonSelectOption>
                </IonSelect>
              </IonItem>

              {paymentMethod === "gcash" && (
                <IonCard className="ion-margin-top">
                  <IonCardHeader>
                    <IonCardTitle>GCash Payment Details</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p>
                      📱 <strong>Number:</strong> 09639539761
                      <br />
                      👤 <strong>Name:</strong> Jay Vicelles
                    </p>
                    <p>Please send your payment to the above GCash account.</p>
                  </IonCardContent>
                </IonCard>
              )}

              {paymentMethod === "gcash" && (
                <>
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

              {startDate && endDate && days > 0 && (
                <>
                  <IonItem>
                    <IonLabel>
                      <strong>Price per day:</strong> ₱{price}
                    </IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonLabel>
                      <strong>
                        Total ({days} day{days > 1 ? "s" : ""}):
                      </strong>{" "}
                      ₱{totalPrice}
                    </IonLabel>
                  </IonItem>
                </>
              )}

              <IonItem>
                <IonLabel position="stacked">Notes (Optional)</IonLabel>
                <IonTextarea
                  placeholder="Any special requirements..."
                  value={notes}
                  onIonInput={(e) => setNotes(e.detail.value ?? "")}
                />
              </IonItem>

              <div className="ion-text-end ion-padding-top">
                <IonButton fill="clear" onClick={onClose}>
                  Cancel
                </IonButton>
                <IonButton color="success" onClick={handleSubmit} disabled={uploading}>
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
