import { IonPage, IonContent, IonCard, IonCardHeader, IonCardTitle, IonButton } from '@ionic/react';

const AdminDashboard: React.FC = () => {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>👑 Admin Dashboard</IonCardTitle>
          </IonCardHeader>
          <div style={{ padding: '16px' }}>
            <p>Welcome, Admin! Manage users, equipment, and bookings here.</p>
            <IonButton expand="block" color="primary" routerLink="/manage-users">
              Manage Users
            </IonButton>
            <IonButton expand="block" color="secondary" routerLink="/manage-equipment">
              Manage Equipment
            </IonButton>
            <IonButton expand="block" color="warning" routerLink="/reports">
              View Reports
            </IonButton>
          </div>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default AdminDashboard;
