import { PushNotifications } from "@capacitor/push-notifications";

export const setupPushNotifications = async () => {
  try {
    const result = await PushNotifications.requestPermissions();
    if (result.receive === "granted") {
      await PushNotifications.register();
    }

    PushNotifications.addListener("registration", (token) => {
      console.log("✅ Push registration success:", token.value);
    });

    PushNotifications.addListener("registrationError", (error) => {
      console.error("❌ Push registration error:", error);
    });

    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      alert(`📢 New Notification: ${notification.title}\n${notification.body}`);
    });
  } catch (err) {
    console.error("Push notification setup failed:", err);
  }
};
