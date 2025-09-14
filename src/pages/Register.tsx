import { useState } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonAlert,
  IonModal,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonInputPasswordToggle,
  IonSelect,
  IonSelectOption
} from '@ionic/react';
import { useAuth } from '../hooks/useAuth';

const Register: React.FC = () => {
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const doRegister = async () => {
    const { error } = await register({
      username,
      firstName,
      lastName,
      email,
      password,
      role,
    });

    if (error) {
      setAlertMessage(error);
      setShowAlert(true);
      return;
    }

    setShowSuccessModal(true);
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Register</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonInput
              placeholder="Username"
              value={username}
              onIonChange={(e) => setUsername(e.detail.value!)}
            />
            <IonInput
              placeholder="First Name"
              value={firstName}
              onIonChange={(e) => setFirstName(e.detail.value!)}
            />
            <IonInput
              placeholder="Last Name"
              value={lastName}
              onIonChange={(e) => setLastName(e.detail.value!)}
            />
            <IonInput
              placeholder="Email"
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
            />
            <IonInput
              placeholder="Password"
              type="password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value!)}
            >
              <IonInputPasswordToggle slot="end" />
            </IonInput>

            <IonSelect
              value={role}
              placeholder="Select Role"
              onIonChange={(e) => setRole(e.detail.value)}
            >
              <IonSelectOption value="admin">Admin</IonSelectOption>
              <IonSelectOption value="user">User</IonSelectOption>
            </IonSelect>

            <IonButton expand="block" onClick={doRegister}>
              Register
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Error"
          message={alertMessage}
          buttons={['OK']}
        />

        <IonModal isOpen={showSuccessModal} onDidDismiss={() => setShowSuccessModal(false)}>
          <IonContent className="ion-padding">
            <h2>Registration Successful!</h2>
            <IonButton expand="block" routerLink="/login">
              Go to Login
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Register;
