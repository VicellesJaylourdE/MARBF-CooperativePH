import { 
  
  IonButton, 
  IonContent, 
  
  IonInput, 
  IonItem, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  useIonRouter 
} from '@ionic/react';


import { useState } from 'react';

const Login: React.FC = () => {
  const navigation = useIonRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const doLogin = () => {
 
    if (!email || !password) {
      setErrorMessage('Both fields are required.');
      return;
    }

   
    setErrorMessage('');
    navigation.push('/MARBF-CooperativePH/app', 'forward');
  };

  return (
    <IonPage>
      <IonContent className='ion-padding'>
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            marginTop: '-10rem',
            marginBottom: '-18rem',
          }}
        >
  

        
        
        </div>

        <IonTitle>LOGIN</IonTitle>

        {errorMessage && (
          <div style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>
            {errorMessage}
          </div>
        )}

        <IonItem>
          <IonInput 
            label="Email"
            type="email"
            value={email}
            placeholder="Enter your email"
            onIonInput={(e) => setEmail(e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonInput
            type={showPassword ? "text" : "password"}
            label="Password"
            value={password}
            placeholder="Enter your password"
            onIonInput={(e) => setPassword(e.detail.value!)}
          />
          <IonButton fill="clear" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? 'Hide' : 'Show'}
          </IonButton>
        </IonItem>

        <IonButton onClick={doLogin} expand="full" style={{ marginTop: '1rem' }}>
          Login
        </IonButton>


        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
        <IonButton routerLink="/MARBF-CooperativePH/app/home/signup" fill="clear">Creating  New Account</IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;