import { useState } from "react";
import { IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonIcon, IonButton, IonSearchbar } from "@ionic/react";
import { cogOutline, contractOutline } from "ionicons/icons";
import { Calendar } from "@ionic-native/calendar";

const EquipmentCatalog: React.FC = () => {
  const [searchText, setSearchText] = useState("");
  const [equipment] = useState([
    { id: 1, name: "Tractor A", category: "Tractor", available: true },
    { id: 2, name: "Harvester B", category: "Harvester", available: true },
    { id: 3, name: "Plow C", category: "Plow", available: true },
  ]);

  const handleBooking = (eqName: string) => {
    alert(`Booked ${eqName}!`);

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    Calendar.createEvent(`Rental: ${eqName}`, "Farm Coop", "Equipment rental booking", startDate, endDate)
      .then(() => console.log("Event created in calendar"))
      .catch((err) => console.error("Calendar error: ", err));
  };

  return (
    <div className="equipment-section">
      <h2 className="equipment-title">
        <IonIcon icon={contractOutline} style={{ marginRight: "6px" }} />
        Available Equipment
      </h2>
      <p className="equipment-sub">Browse and book agricultural equipment for your farming needs</p>

      <IonSearchbar
        value={searchText}
        onIonInput={(e) => setSearchText(e.detail.value!)}
        placeholder="Search equipment by name, category, or description..."
      />

      <IonGrid>
        <IonRow>
          {equipment
            .filter(
              (eq) =>
                eq.name.toLowerCase().includes(searchText.toLowerCase()) ||
                eq.category.toLowerCase().includes(searchText.toLowerCase())
            )
            .map((eq) => (
              <IonCol size="6" sizeMd="4" key={eq.id}>
                <IonCard className="equipment-card">
                  <IonCardContent>
                    <IonIcon icon={cogOutline} className="equip-icon" />
                    <h3>{eq.name}</h3>
                    <p>{eq.category}</p>
                    <IonButton expand="block" size="small" color="success" onClick={() => handleBooking(eq.name)}>
                      Book Now
                    </IonButton>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
        </IonRow>
      </IonGrid>
    </div>
  );
};

export default EquipmentCatalog;
