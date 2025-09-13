import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonButton } from '@ionic/react';

const UserDashboard: React.FC = () => {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>🙋 User Dashboard</IonCardTitle>
          </IonCardHeader>
          <div style={{ padding: '16px' }}>
            <p>Welcome! Book equipment and track your rentals here.</p>
            <IonButton expand="block" color="success" routerLink="/book-equipment">
              Book Equipment
            </IonButton>
            <IonButton expand="block" color="tertiary" routerLink="/my-rentals">
              My Rentals
            </IonButton>
          </div>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default UserDashboard;
