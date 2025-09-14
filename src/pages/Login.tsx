import { useState } from 'react';
import {
  IonAlert,
  IonButton,
  IonContent,
  IonInput,
  IonInputPasswordToggle,
  IonPage,
  IonToast,
  useIonRouter
} from '@ionic/react';
import { useAuth } from '../hooks/useAuth';

const Login: React.FC = () => {
  const navigation = useIonRouter();
  const { login, role } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const doLogin = async () => {
    const { error } = await login(email, password);

    if (error) {
      setAlertMessage(error);
      setShowAlert(true);
      return;
    }

    setShowToast(true);

    setTimeout(() => {
      if (role === 'admin') {
        navigation.push('/admin-dashboard', 'forward', 'replace');
      } else {
        navigation.push('/user-dashboard', 'forward', 'replace');
      }
    }, 300);
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="login-container">
          <div className="login-card">
            <h1 className="login-title">USER LOGIN</h1>
            <p className="login-subtitle">Please login or sign up to continue</p>

            <IonInput
              placeholder="Your Email"
              type="email"
              fill="outline"
              className="input-field"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
            />

            <IonInput
              placeholder="Your Password"
              type="password"
              fill="outline"
              className="input-field"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value!)}
            >
              <IonInputPasswordToggle slot="end" />
            </IonInput>

            <IonButton onClick={doLogin} expand="block" fill="solid" className="login-btn">
              Sign In
            </IonButton>

            <IonButton routerLink="/register" expand="block" fill="clear" className="register-btn">
              Don&apos;t have an account?
            </IonButton>
          </div>
        </div>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Notification"
          message={alertMessage}
          buttons={['OK']}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Login successful! Redirecting..."
          duration={1500}
          position="top"
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
