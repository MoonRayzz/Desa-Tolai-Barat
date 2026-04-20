import { adminDb } from "./admin";
import * as admin from "firebase-admin";

export async function logVisitAdmin(data: {
  page: string;
  city: string;
  region: string;
  country: string;
  os: string;
  browser: string;
  device: string;
}): Promise<void> {
  try {
    // 1. Simpan log spesifik ke analytics_visits
    await adminDb.collection("analytics_visits").add({
      ...data,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2. Simpan agregrasi harian ke analytics_daily
    const today = new Date().toISOString().split("T")[0];
    const dayRef = adminDb.collection("analytics_daily").doc(today);
    
    await adminDb.runTransaction(async (transaction) => {
      const doc = await transaction.get(dayRef);
      if (!doc.exists) {
        transaction.set(dayRef, {
          date: today,
          count: 1,
          cities: { [data.city]: 1 },
          regions: { [data.region]: 1 },
          os: { [data.os]: 1 },
          browsers: { [data.browser]: 1 },
          devices: { [data.device]: 1 },
          pages: { [data.page]: 1 },
        });
      } else {
        const docData = doc.data()!;
        transaction.update(dayRef, 
          new admin.firestore.FieldPath("count"), admin.firestore.FieldValue.increment(1),
          new admin.firestore.FieldPath("cities", data.city), admin.firestore.FieldValue.increment(1),
          new admin.firestore.FieldPath("regions", data.region), admin.firestore.FieldValue.increment(1),
          new admin.firestore.FieldPath("os", data.os), admin.firestore.FieldValue.increment(1),
          new admin.firestore.FieldPath("browsers", data.browser), admin.firestore.FieldValue.increment(1),
          new admin.firestore.FieldPath("devices", data.device), admin.firestore.FieldValue.increment(1),
          new admin.firestore.FieldPath("pages", data.page), admin.firestore.FieldValue.increment(1)
        );
      }
    });
  } catch (error) {
    console.error("Gagal melakukan logVisit via admin:", error);
  }
}
