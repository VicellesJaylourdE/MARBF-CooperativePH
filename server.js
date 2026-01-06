import express from 'express';
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';

const app = express();
app.use(express.json());

// 1. Pag-load sa imong Service Account Key
const serviceAccount = JSON.parse(
  await readFile(new URL('./serviceAccountKey.json', import.meta.url))
);

// 2. I-initialize ang Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// 3. Ang pultahan para sa Supabase Webhook
app.post('/webhook', async (req, res) => {
  const { record } = req.body;
  console.log('NAAY NADAWAT NGA DATA GIKAN SA SUPABASE:', record);

  try {
    const message = {
      notification: {
        title: '🚨 Bag-ong Booking!',
        body: `Naay bag-ong abang para sa: ${record.equipment_name || 'Item'}`,
      },
      // I-send kini sa 'admin_notifications' topic
      topic: 'admin_notifications', 
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    res.status(200).send('Success');
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send('Error');
  }
});

app.listen(3000, () => {
  console.log('✅ Server is running on port 3000');
});