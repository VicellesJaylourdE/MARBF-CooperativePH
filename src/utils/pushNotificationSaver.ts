import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from './supabaseClient';

export const saveDeviceToken = async (userId: number, role: string) => {
  if (!userId) return;

  const table = (role === 'admin' || role === 'staff') 
    ? 'admin_staff_devices' 
    : 'customer_devices';
  
  try {
    const status = await PushNotifications.requestPermissions();
    if (status.receive !== 'granted') return;

    await PushNotifications.register();

    PushNotifications.addListener('registration', async (token) => {
      console.log(`Token acquired for ${role}:`, token.value);
      
      const { error } = await supabase
        .from(table)
        .upsert({ user_id: userId, device_token: token.value }, { onConflict: 'user_id' });
      
      if (error) console.error(`Error saving token to ${table}:`, error.message);
    });

  } catch (e) {
    console.error('Error in push notification setup:', e);
  }
};