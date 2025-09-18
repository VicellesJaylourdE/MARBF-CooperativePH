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
import { supabase } from '../utils/supabaseClient';

const AlertBox: React.FC<{ message: string; isOpen: boolean; onClose: () => void }> = ({ message, isOpen, onClose }) => {
  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={onClose}
      header="Notification"
      message={message}
      buttons={['OK']}
    />
  );
};

const Login: React.FC = () => {
  const navigation = useIonRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const doLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setAlertMessage(error.message);
      setShowAlert(true);
      return;
    }

    const user = data.user;
    if (!user) {
      setAlertMessage("User not found.");
      setShowAlert(true);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('user_email', email)
      .single();

    if (userError || !userData) {
      setAlertMessage("Unable to fetch user role.");
      setShowAlert(true);
      return;
    }

    setShowToast(true);

    setTimeout(() => {
     if (userData.role === 'admin') {
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

            <IonButton routerLink="/" expand="block" fill="clear" className="register-btn">
              Don&apos;t have an account?
            </IonButton>
          </div>
        </div>

        <AlertBox message={alertMessage} isOpen={showAlert} onClose={() => setShowAlert(false)} />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Login successful! Redirecting..."
          duration={1500}
          position="top"
          color="success"
        />
      </IonContent>

      <style>
        {`
          .login-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
          }
          .login-card {
            width: 360px;
            padding: 25px;
            background: #ffffff;
            border-radius: 15px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .login-title {
            font-size: 22px;
            font-weight: bold;
            color: black;
            margin-bottom: 8px;
          }
          .login-subtitle {
            font-size: 14px;
            color: #333;
            text-align: center;
            margin-bottom: 20px;
          }
          .input-field {
            width: 100%;
            margin-bottom: 12px;
            --highlight-color-focused: #9ACD32;
            --border-color: #9ACD32;
            --color: black;
          }
          .login-btn {
            --background: #9ACD32;
            --color: black;
            width: 100%;
            margin-top: 10px;
          }
          .register-btn {
            --color: green;
            margin-top: 8px;
            font-weight: bold;
            text-transform: none;
          }
        `}
      </style>
    </IonPage>
  );
};

export default Login;