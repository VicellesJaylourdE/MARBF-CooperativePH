import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
} from "@ionic/react";
import BookingModal from "./BookingModal";

const EquipmentCatalog: React.FC = () => {
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const equipmentList = [
    { id: 1, name: "Tractor", description: "Heavy duty farming tractor" },
    { id: 2, name: "Plow", description: "Soil preparation tool" },
    { id: 3, name: "Harvester", description: "Used for harvesting crops" },
  ];

  const handleBookNow = (equipmentName: string) => {
    setSelectedEquipment(equipmentName);
    setIsModalOpen(true);
  };

  const handleSubmitBooking = (booking: {
    startDate: string;
    endDate: string;
    notes: string;
  }) => {
    console.log("Booking submitted:", { equipment: selectedEquipment, ...booking });
    setIsModalOpen(false);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Equipment Catalog</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {equipmentList.map((item) => (
          <IonCard key={item.id}>
            <IonCardHeader>
              <IonCardTitle>{item.name}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>{item.description}</p>
              <IonButton
                expand="block"
                color="success"
                onClick={() => handleBookNow(item.name)}
              >
                Book Now
              </IonButton>
            </IonCardContent>
          </IonCard>
        ))}

        {/* Booking Modal */}
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitBooking}
          equipmentName={selectedEquipment || ""}
        />
      </IonContent>
    </IonPage>
  );
};

export default EquipmentCatalog;
