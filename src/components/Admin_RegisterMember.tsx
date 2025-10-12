import React, { useState } from 'react';
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
import { supabase } from '../utils/supabaseClient';
import bcrypt from 'bcryptjs';

const Admin_RegisterMember: React.FC = () => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user' | 'staff'>('user');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const doRegister = async () => {
    try {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw new Error(signUpError.message);

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const { error: dbError } = await supabase.from('users').insert([{
        username,
        user_email: email,
        user_firstname: firstName,
        user_lastname: lastName,
        user_password: hashedPassword,
        role
      }]);

      if (dbError) throw new Error(dbError.message);

      setShowSuccessModal(true);
    } catch (error) {
      if (error instanceof Error) {
        setAlertMessage(error.message);
      } else {
        setAlertMessage('An unexpected error occurred.');
      }
      setShowAlert(true);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Register Member</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {/* Excel-style table container */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={rowStyle}>
                    <td style={cellStyle}><strong>Username</strong></td>
                    <td style={cellStyle}>
                      <IonInput
                        placeholder="Username"
                        value={username}
                        onIonChange={(e) => setUsername(e.detail.value!)}
                      />
                    </td>
                  </tr>

                  <tr style={rowStyle}>
                    <td style={cellStyle}><strong>First Name</strong></td>
                    <td style={cellStyle}>
                      <IonInput
                        placeholder="First Name"
                        value={firstName}
                        onIonChange={(e) => setFirstName(e.detail.value!)}
                      />
                    </td>
                  </tr>

                  <tr style={rowStyle}>
                    <td style={cellStyle}><strong>Last Name</strong></td>
                    <td style={cellStyle}>
                      <IonInput
                        placeholder="Last Name"
                        value={lastName}
                        onIonChange={(e) => setLastName(e.detail.value!)}
                      />
                    </td>
                  </tr>

                  <tr style={rowStyle}>
                    <td style={cellStyle}><strong>Email</strong></td>
                    <td style={cellStyle}>
                      <IonInput
                        placeholder="Email"
                        type="email"
                        value={email}
                        onIonChange={(e) => setEmail(e.detail.value!)}
                      />
                    </td>
                  </tr>

                  <tr style={rowStyle}>
                    <td style={cellStyle}><strong>Password</strong></td>
                    <td style={cellStyle}>
                      <IonInput
                        placeholder="Password"
                        type="password"
                        value={password}
                        onIonChange={(e) => setPassword(e.detail.value!)}
                      >
                        <IonInputPasswordToggle slot="end" />
                      </IonInput>
                    </td>
                  </tr>

                  <tr style={rowStyle}>
                    <td style={cellStyle}><strong>Role</strong></td>
                    <td style={cellStyle}>
                      <IonSelect
                        value={role}
                        placeholder="Select Role"
                        onIonChange={(e) => setRole(e.detail.value)}
                      >
                        <IonSelectOption value="admin">Admin</IonSelectOption>
                        <IonSelectOption value="staff">Staff</IonSelectOption>
                        <IonSelectOption value="user">User</IonSelectOption>
                      </IonSelect>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <IonButton expand="block" onClick={doRegister} style={{ marginTop: '1rem' }}>
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
            <IonButton expand="block" routerLink="/login" style={{ marginTop: '1rem' }}>
              Go to Login
            </IonButton>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

const rowStyle: React.CSSProperties = {
  borderBottom: '1px solid #ddd',
};

const cellStyle: React.CSSProperties = {
  padding: '10px',
  verticalAlign: 'middle',
};

export default Admin_RegisterMember;
