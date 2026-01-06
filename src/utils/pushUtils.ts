import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from './supabaseClient'; // Siguroha nga sakto ang path sa imong supabaseClient

export const saveDeviceToken = async (userId: number, role: string) => {
  if (!userId) return;

  // Pilia ang table base sa role sa user
  const table = (role === 'admin' || role === 'staff') 
    ? 'admin_staff_devices' 
    : 'customer_devices';
  
  try {
    // 1. Mangayo og permission sa user
    const status = await PushNotifications.requestPermissions();
    if (status.receive !== 'granted') {
      console.log("Push permission denied.");
      return;
    }

    
    await PushNotifications.register();

    // 3. Maminaw sa 'registration' event aron makuha ang token
    PushNotifications.addListener('registration', async (token) => {
      console.log(`Token acquired:`, token.value);
      
      // I-save sa Supabase (upsert para ma-update kon naa na daan)
      const { error } = await supabase
        .from(table)
        .upsert({ 
          user_id: userId, 
          device_token: token.value 
        }, { onConflict: 'user_id' });
      
      if (error) {
        console.error(`Error saving token to ${table}:`, error.message);
      } else {
        console.log(`✅ Token successfully saved to ${table}`);
      }
    });

    // Listener para sa mga errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Registration error: ', error);
    });

  } catch (e) {
    console.error('Error in push notification setup:', e);
  }
};