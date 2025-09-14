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
} from "@ionic/react";

import "./BookingModal.css"; 

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (booking: { startDate: string; endDate: string; notes: string }) => void;
  equipmentName: string;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  equipmentName,
}) => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      alert("Please enter start and end dates.");
      return;
    }
    onSubmit({ startDate, endDate, notes });
    onClose();
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      backdropDismiss={false}
      className="booking-modal-card" 
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>📅 Book Equipment</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>✕</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <p className="text-gray-500 mb-4">
          Reserve <b>{equipmentName}</b> for your farming needs
        </p>

        <IonGrid>
          <IonRow>
            <IonCol>
              <IonItem>
                <IonLabel position="stacked">Start Date (dd/mm/yyyy)</IonLabel>
                <IonInput
                  type="text"
                  placeholder="e.g. 14/09/2025"
                  value={startDate}
                  onIonInput={(e) => setStartDate(e.detail.value ?? "")}
                />
              </IonItem>
            </IonCol>

            <IonCol>
              <IonItem>
                <IonLabel position="stacked">End Date (dd/mm/yyyy)</IonLabel>
                <IonInput
                  type="text"
                  placeholder="e.g. 20/09/2025"
                  value={endDate}
                  onIonInput={(e) => setEndDate(e.detail.value ?? "")}
                />
              </IonItem>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonItem>
          <IonLabel position="stacked">Notes (Optional)</IonLabel>
          <IonTextarea
            placeholder="Any special requirements or notes..."
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
      </IonContent>
    </IonModal>
  );
};

export default BookingModal;
