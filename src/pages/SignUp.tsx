import { 
  IonButton, 
  IonContent, 
  IonInput, 
  IonItem, 
  IonPage, 
  IonTitle, 
  IonToast, 
  useIonRouter, 
  IonCard, 
  IonCardContent, 
  IonLabel, 
  IonSpinner 
} from '@ionic/react';
import { useState } from 'react';

const SignUp: React.FC = () => {
  const navigation = useIonRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showUsername, setShowUsername] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email || !password || !username) {
      setErrorMessage('All fields are required.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Invalid email format.');
      return false;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return false;
    }
    return true;
  };

  const handleSignUp = () => {
    if (!validateForm()) {
      setShowToast(true);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    console.log('User signed up:', { username, email, password });

    setTimeout(() => {
      setLoading(false);
      setShowToast(true);
      navigation.push('/it35-lab', 'forward');
    }, 1500);
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonTitle className="ion-text-center">Register</IonTitle>

        <IonCard>
          <IonCardContent>
            {/* Username Input */} 
            <IonItem style={{ '--inner-padding-top': '5px', '--inner-padding-bottom': '5px' }}>
            <IonLabel position="stacked" style={{ fontSize: '14px', marginBottom: '-5px' }}>
                  Username
             </IonLabel>
            <IonInput
             type="text"
             value={username}
            onIonInput={(e) => setUsername(e.detail.value!)}
            />
            </IonItem>


             {/* Email Input */}
    <IonItem style={{ '--inner-padding-top': '5px', '--inner-padding-bottom': '5px' }}>
      <IonLabel position="stacked" style={{ fontSize: '14px', marginBottom: '-5px' }}>
        Email
      </IonLabel>
      <IonInput
        type="email"
        value={showEmail ? email : ''}
        onIonFocus={() => setShowEmail(true)}
        onIonBlur={() => setShowEmail(email.length > 0)}
        onIonInput={(e) => setEmail(e.detail.value!)}
      />
    </IonItem>

           {/* Password Input */}
    <IonItem style={{ '--inner-padding-top': '5px', '--inner-padding-bottom': '5px' }}>
      <IonLabel position="stacked" style={{ fontSize: '14px', marginBottom: '-5px' }}>
        Password
      </IonLabel>
      <IonInput
        type="password"
        value={showPassword ? password : ''}
        onIonFocus={() => setShowPassword(true)}
        onIonBlur={() => setShowPassword(password.length > 0)}
        onIonInput={(e) => setPassword(e.detail.value!)}
      />
    </IonItem>

            <IonButton expand="full" onClick={handleSignUp} disabled={loading}>
              {loading ? <IonSpinner name="dots" /> : 'Sign Up'}
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          duration={2000}
          message={errorMessage || 'Registration successful! Redirecting...'}
          color={errorMessage ? 'danger' : 'success'}
        />
      </IonContent>
    </IonPage>
  );
};

export default SignUp;