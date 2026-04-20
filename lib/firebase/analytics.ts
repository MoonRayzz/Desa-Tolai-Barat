import {
  collection, addDoc, getDocs, getDoc,
  doc, setDoc, updateDoc, query,
  orderBy, limit, Timestamp,
} from "firebase/firestore";
import { db } from "./config";

export interface DailyStat {
  date:    string;
  count:   number;
  cities:  Record<string, number>;
  regions: Record<string, number>;
  os?:     Record<string, number>;
  browsers?: Record<string, number>;
  devices?: Record<string, number>;
  pages?:  Record<string, number>;
}

export async function logVisit(data: {
  page:    string;
  city:    string;
  region:  string;
  country: string;
}): Promise<void> {
  try {
    await addDoc(collection(db, "analytics_visits"), {
      ...data,
      timestamp: Timestamp.now(),
    });

    const today  = new Date().toISOString().split("T")[0];
    const dayRef = doc(db, "analytics_daily", today);
    const daySnap = await getDoc(dayRef);

    if (daySnap.exists()) {
      const d = daySnap.data();
      const cities  = { ...(d.cities  || {}), [data.city]:   ((d.cities  || {})[data.city]   || 0) + 1 };
      const regions = { ...(d.regions || {}), [data.region]: ((d.regions || {})[data.region] || 0) + 1 };
      await updateDoc(dayRef, { count: (d.count || 0) + 1, cities, regions });
    } else {
      await setDoc(dayRef, {
        date:    today,
        count:   1,
        cities:  { [data.city]:   1 },
        regions: { [data.region]: 1 },
      });
    }
  } catch {
    // silent fail — jangan sampai break halaman publik
  }
}

export interface AnalyticsData {
  total: number;
  today: number;
  thisMonth: number;
  last7: DailyStat[];
  todayCities: { city: string; count: number }[];
  thisMonthCities: { city: string; count: number }[];
  topCities: { city: string; count: number }[];
  topRegions: { region: string; count: number }[];
  topOS: { os: string; count: number }[];
  topBrowsers: { browser: string; count: number }[];
  topDevices: { device: string; count: number }[];
  topPages: { page: string; count: number }[];
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  try {
    const snap = await getDocs(collection(db, "analytics_daily"));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
    
    let total = 0;
    let today = 0;
    let thisMonth = 0;
    
    const todayStr = new Date().toISOString().split("T")[0];
    const monthStr = todayStr.slice(0, 7);

    const cityMap: Record<string, number> = {};
    const regionMap: Record<string, number> = {};
    const osMap: Record<string, number> = {};
    const browserMap: Record<string, number> = {};
    const deviceMap: Record<string, number> = {};
    const pageMap: Record<string, number> = {};
    
    const todayCityMap: Record<string, number> = {};
    const monthCityMap: Record<string, number> = {};

    docs.forEach(d => {
      const cnt = d.count || 0;
      total += cnt;
      if (d.id === todayStr) {
        today += cnt;
        Object.entries(d.cities || {}).forEach(([k, v]) => { todayCityMap[k] = (todayCityMap[k] || 0) + (v as number) });
      }
      if (d.id.startsWith(monthStr)) {
        thisMonth += cnt;
        Object.entries(d.cities || {}).forEach(([k, v]) => { monthCityMap[k] = (monthCityMap[k] || 0) + (v as number) });
      }

      // Aggregate cities
      Object.entries(d.cities || {}).forEach(([k, v]) => { cityMap[k] = (cityMap[k] || 0) + (v as number) });
      // Aggregate regions
      Object.entries(d.regions || {}).forEach(([k, v]) => { regionMap[k] = (regionMap[k] || 0) + (v as number) });
      // Aggregate os
      Object.entries(d.os || {}).forEach(([k, v]) => { osMap[k] = (osMap[k] || 0) + (v as number) });
      // Aggregate browsers
      Object.entries(d.browsers || {}).forEach(([k, v]) => { browserMap[k] = (browserMap[k] || 0) + (v as number) });
      // Aggregate devices
      Object.entries(d.devices || {}).forEach(([k, v]) => { deviceMap[k] = (deviceMap[k] || 0) + (v as number) });
      // Aggregate pages
      Object.entries(d.pages || {}).forEach(([k, v]) => { pageMap[k] = (pageMap[k] || 0) + (v as number) });
    });

    // Handle last 7 days carefully (sort by id descending, take 7, then reverse to ascending)
    // We use d.id because d.id is YYYY-MM-DD. This avoids missing 'date' field issues!
    const sortedDocs = [...docs].sort((a, b) => b.id.localeCompare(a.id));
    const last7 = sortedDocs.slice(0, 7).map(d => ({ date: d.id, ...d } as DailyStat)).reverse();

    const toSortedArray = (map: Record<string, number>, n: number, keyName: string) => 
      Object.entries(map).map(([k, count]) => ({ [keyName]: k, count }) as any).sort((a, b) => b.count - a.count).slice(0, n);

    return {
      total,
      today,
      thisMonth,
      last7,
      todayCities: toSortedArray(todayCityMap, 5, "city"),
      thisMonthCities: toSortedArray(monthCityMap, 5, "city"),
      topCities: toSortedArray(cityMap, 10, "city"),
      topRegions: toSortedArray(regionMap, 10, "region"),
      topOS: toSortedArray(osMap, 5, "os"),
      topBrowsers: toSortedArray(browserMap, 5, "browser"),
      topDevices: toSortedArray(deviceMap, 3, "device"),
      topPages: toSortedArray(pageMap, 10, "page"),
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return {
      total: 0, today: 0, thisMonth: 0, last7: [],
      todayCities: [], thisMonthCities: [],
      topCities: [], topRegions: [], topOS: [], topBrowsers: [], topDevices: [], topPages: []
    };
  }
}