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
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (booking: { startDate: string; endDate: string; notes: string; location: string }) => void;
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
  const [location, setLocation] = useState<string>(""); // ✅ Added location
  const [toastMsg, setToastMsg] = useState<string>("");

  const days =
    startDate && endDate
      ? (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24) + 1
      : 0;
  const totalPrice = days > 0 ? days * price : 0;

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      alert("Please select start and end dates.");
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

      // ✅ Insert booking with location
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
            location, // ✅ Added location
            status: "pending",
            total_price: totalPrice,
          },
        ])
        .select()
        .single();

      if (bookingError) throw bookingError;

      // ✅ Insert transaction
      const { error: transactionError } = await supabase.from("transactions").insert([
        {
          booking_id: bookingData.id,
          user_id: user.id,
          amount: totalPrice,
          status: "unpaid",
        },
      ]);

      if (transactionError) throw transactionError;

      onSubmit({ startDate, endDate, notes, location });
      setToastMsg("Booking submitted successfully!");
      setStartDate("");
      setEndDate("");
      setNotes("");
      setLocation(""); // ✅ reset location
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
            <IonTitle>📅 Book Equipment</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={onClose}>✕</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Reserve "{equipmentName}"</IonCardTitle>
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

              {/* ✅ Location Input */}
              <IonItem>
                <IonLabel position="stacked">Location</IonLabel>
                <IonInput
                  placeholder="Enter location or pickup point"
                  value={location}
                  onIonInput={(e) => setLocation(e.detail.value ?? "")}
                />
              </IonItem>

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
                <IonButton color="success" onClick={handleSubmit}>
                  Submit Booking
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
