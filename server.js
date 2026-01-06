require('dotenv').config();
const admin = require('firebase-admin');
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());


const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY 
);

// 3. Webhook Route
app.post('/bookings-webhook', async (req, res) => {
  const { record, old_record, type } = req.body;

  // Maminaw lang kon naay UPDATE sa status
  if (type === 'UPDATE' && record.status !== old_record.status) {
    const userId = record.user_id;
    const newStatus = record.status;
    const equipName = record.equipment_name;

    console.log(`Processing ${newStatus} for User ID: ${userId}`);

    try {
      // STEP A: Kuhaon ang FCM Token sa specific user
      const { data: tokenData, error: tokenError } = await supabase
        .from('fcm_tokens')
        .select('token')
        .eq('user_id', userId)
        .single();

      if (tokenError || !tokenData) {
        console.error(`❌ No token found for User ${userId}`);
        return res.status(200).send('No token, no notification sent.');
      }

      const userToken = tokenData.token;

      // STEP B: I-set ang Mensahe base sa Status
      let title = "Rental Update";
      let body = `Your booking for ${equipName} is now ${newStatus}.`;

      switch (newStatus) {
        case 'approved':
          title = "✅ Booking Approved!";
          body = `Approved na imong booking sa ${equipName}. Palihog bayad sa transaction section.`;
          break;
        case 'declined':
          title = "❌ Booking Declined";
          body = `Pasensya, ang imong booking sa ${equipName} wala madawat.`;
          break;
        case 'in_use':
          title = "🚀 Enjoy your Rental!";
          body = `Nagsugod na ang imong paggamit sa ${equipName}.`;
          break;
        case 'returned':
          title = "📦 Item Returned";
          body = `Salamat! Nadawat na namo ang ${equipName}.`;
          break;
      }

      // STEP C: I-send ang Notification pinaagi sa Firebase
      const message = {
        notification: { title, body },
        token: userToken,
        // Optional: I-add ni para mo-pop up bisan naka-background ang app
        android: {
          notification: {
            priority: 'high',
            sound: 'default'
          }
        }
      };

      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);

    } catch (err) {
      console.error('Error in Webhook logic:', err);
    }
  }

  res.status(200).send('Webhook Processed');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Notification Server running on port ${PORT}`));