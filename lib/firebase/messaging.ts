// File: lib/firebase/messaging.ts
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import app, { db } from "./config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function getFirebaseMessaging() {
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
}

export async function requestFCMToken(): Promise<string | null> {
  try {
    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.log("Firebase Messaging tidak didukung pada browser ini.");
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Izin notifikasi ditolak oleh pengguna.");
      return null;
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) {
      console.error("VAPID KEY belum diset di .env.local!");
      return null;
    }

    const currentToken = await getToken(messaging, { vapidKey });
    
    if (currentToken) {
      // Simpan/Update token ke Firestore agar backend tahu siapa saja yang akan dibroadcast
      await setDoc(doc(db, "fcm_tokens", currentToken), {
        token: currentToken,
        updatedAt: serverTimestamp(),
        device: navigator.userAgent,
      });
      return currentToken;
    } else {
      console.log("Tidak ada token registrasi tersedia.");
      return null;
    }
  } catch (error) {
    console.error("Gagal mendapatkan FCM Token:", error);
    return null;
  }
}
