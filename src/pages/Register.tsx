import React, { useState } from 'react';
import {
    IonPage,
    IonContent,
    IonInput,
    IonButton,
    IonModal,
    IonAlert,
    IonText,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonInputPasswordToggle,
} from '@ionic/react';
import { supabase } from '../utils/supabaseClient';
import bcrypt from 'bcryptjs';

const AlertBox: React.FC<{ message: string; isOpen: boolean; onClose: () => void }> = ({ message, isOpen, onClose }) => (
    <IonAlert
        isOpen={isOpen}
        onDidDismiss={onClose}
        header="Notification"
        message={message}
        buttons={['OK']}
    />
);

const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);

    const validatePassword = (password: string) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(password);
    };

    const handleOpenVerificationModal = () => {
        if (!email.endsWith('')) {
            setAlertMessage('');
            setShowAlert(true);
            return;
        }
        if (password !== confirmPassword) {
            setAlertMessage('Passwords do not match.');
            setShowAlert(true);
            return;
        }
        if (!validatePassword(password)) {
            setAlertMessage('Password must have at least 8 characters, one uppercase, one lowercase, and one number.');
            setShowAlert(true);
            return;
        }
        setShowVerificationModal(true);
    };

    const doRegister = async () => {
        setShowVerificationModal(false);
        try {
            const { error: signUpError } = await supabase.auth.signUp({ email, password });
            if (signUpError) {
                throw new Error(signUpError.message);
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const { error: dbError } = await supabase.from('users').insert([{
                username,
                user_email: email,
                user_firstname: firstName,
                user_lastname: lastName,
                user_password: hashedPassword,
            }]);

            if (dbError) {
                throw new Error(dbError.message);
            }

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
            <IonContent className="ion-padding" fullscreen>
                {/* Floating Animation and Card Styles */}
                <style>
                    {`
                    @keyframes floatCard {
                        0%, 100% {
                            transform: translateY(0);
                            box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2), 0 0 20px 3px rgba(221, 221, 240, 0.6);
                        }
                        50% {
                            transform: translateY(-20px);
                            box-shadow: 0 25px 40px rgba(0, 0, 0, 0.3), 0 0 35px 7px rgba(227, 237, 33, 0.8);
                        }
                    }

                    .register-card {
                        max-width: 380px;
                        margin: 8% auto 0 auto;
                        padding: 25px 25px 30px 25px;
                        background: #1e1e2f;
                        border-radius: 20px;
                        animation: floatCard 6s ease-in-out infinite;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        box-shadow: 0 8px 20px rgba(108, 99, 255, 0.3);
                    }

                    .register-title {
                        font-size: 26px;
                        color: white;
                        margin-bottom: 5px;
                        text-align: left;
                        width: 100%;
                    }

                    .register-subtitle {
                        color: #aaa;
                        font-size: 16px;
                        margin-bottom: 20px;
                        text-align: left;
                        width: 100%;
                    }

                    .modal-content {
                        padding: 20px;
                        text-align: center;
                    }
                    `}
                </style>

                <div className="register-card">
                    <h1 className="register-title">
                        Let's<br />Create Your Account
                    </h1>
                    <p className="register-subtitle">
                        Fill in the details below to register
                    </p>

                    <IonInput
                        label="Username"
                        labelPlacement="stacked"
                        fill="outline"
                        value={username}
                        placeholder="Enter a unique username"
                        onIonInput={e => setUsername(e.detail.value!)}
                        style={{
                          borderRadius: '12px',
                          marginBottom: '10px',
                          '--highlight-color-focused': '#ACC572',
                          '--border-color': '#ACC572'
                        }}
                    />
                    <IonInput
                        label="Email"
                        labelPlacement="stacked"
                        fill="outline"
                        type="email"
                        value={email}
                        placeholder="Email"
                        onIonInput={e => setEmail(e.detail.value!)}
                        style={{
                          borderRadius: '12px',
                          marginBottom: '10px',
                          '--highlight-color-focused': '#ACC572',
                          '--border-color': '#ACC572'
                        }}
                    />
                    <IonInput
                        label="Password"
                        labelPlacement="stacked"
                        fill="outline"
                        type="password"
                        value={password}
                        placeholder="Enter password"
                        onIonInput={e => setPassword(e.detail.value!)}
                        style={{
                          borderRadius: '12px',
                          marginBottom: '10px',
                          '--highlight-color-focused': '#ACC572',
                          '--border-color': '#ACC572'
                        }}
                    >
                        <IonInputPasswordToggle slot="end" />
                    </IonInput>
                    <IonInput
                        label="Confirm Password"
                        labelPlacement="stacked"
                        fill="outline"
                        type="password"
                        value={confirmPassword}
                        placeholder="Confirm password"
                        onIonInput={e => setConfirmPassword(e.detail.value!)}
                        style={{
                          borderRadius: '12px',
                          marginBottom: '10px',
                          '--highlight-color-focused': '#ACC572',
                          '--border-color': '#ACC572'
                        }}
                    >
                        <IonInputPasswordToggle slot="end" />
                    </IonInput>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', marginTop: '10px', width: '100%' }}>
             <input
               type="checkbox"
               id="terms"
               checked={agreeTerms}
               onChange={(e) => setAgreeTerms(e.target.checked)}
               style={{ marginRight: '8px' }}
             />
             <label htmlFor="terms" style={{ fontSize: '14px', color: '#aaa' }}>
               I agree to the <a href="#" style={{ color: '#A76545', textDecoration: 'none' }}>Terms & Conditions</a>
             </label>
           </div>
                    <IonButton
                        expand="full"
                        color="warning"
                        onClick={handleOpenVerificationModal}
                    >
                        Register
                    </IonButton>

                    <IonButton
                        routerLink="/MARBF-CooperativePH"
                        expand="full"
                        fill="clear"
                        shape="round"
                          color="success"
                    >
                        Already have an account?
                    </IonButton>
                </div>
                <IonModal isOpen={showVerificationModal} onDidDismiss={() => setShowVerificationModal(false)}>
                    <IonContent className="ion-padding">
                        <IonCard style={{ marginTop: '20%' }}>
                            <IonCardHeader>
                                <IonCardTitle>User Registration Details</IonCardTitle>
                                <hr />
                                <IonCardSubtitle>Username</IonCardSubtitle>
                                <IonCardTitle>{username}</IonCardTitle>

                                <IonCardSubtitle>Email</IonCardSubtitle>
                                <IonCardTitle>{email}</IonCardTitle>

                                <IonCardSubtitle>Name</IonCardSubtitle>
                                <IonCardTitle>{firstName} {lastName}</IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent></IonCardContent>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '5px' }}>
                                <IonButton fill="clear" onClick={() => setShowVerificationModal(false)}>Cancel</IonButton>
                                <IonButton color="primary" onClick={doRegister}>Confirm</IonButton>
                            </div>
                        </IonCard>
                    </IonContent>
                </IonModal>

                <IonModal isOpen={showSuccessModal} onDidDismiss={() => setShowSuccessModal(false)}>
                    <IonContent className="ion-padding" style={{ textAlign: 'center', marginTop: '25%' }}>
                        <IonCard>
                            <IonCardHeader>
                                <IonCardTitle>Registration Successful 🎉</IonCardTitle>
                                <IonCardSubtitle>Check your email for confirmation</IonCardSubtitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <IonButton routerLink="/MARBF-CooperativePH" routerDirection="back" color="primary">
                                    Go to Login
                                </IonButton>
                            </IonCardContent>
                        </IonCard>
                    </IonContent>
                </IonModal>

          
                <AlertBox message={alertMessage} isOpen={showAlert} onClose={() => setShowAlert(false)} />
            </IonContent>
        </IonPage>
    );
};

export default Register;