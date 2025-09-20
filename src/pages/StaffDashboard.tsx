import { 
    IonPage, 
    IonContent, 
    IonCard, 
    IonCardHeader,
    IonCardTitle, 
    IonButton } 
     from '@ionic/react';

const StaffDashboard: React.FC = () => {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>🛠️ Staff Dashboard</IonCardTitle>
          </IonCardHeader>
          <div style={{ padding: '16px' }}>
            <p>Welcome, Staff! Manage daily tasks and assist with rentals here.</p>

            <IonButton expand="block" color="primary" routerLink="/manage-bookings">
              Manage Bookings
            </IonButton>

            <IonButton expand="block" color="secondary" routerLink="/equipment-status">
              Update Equipment Status
            </IonButton>

            <IonButton expand="block" color="success" routerLink="/support">
              Customer Support
            </IonButton>
          </div>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default StaffDashboard;
