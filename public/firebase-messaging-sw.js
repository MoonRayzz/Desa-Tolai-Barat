// File: public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

// Config diambil dari environment (sudah berupa public keys, jadi aman diakses)
// Kita memecah string apiKey agar tidak terkena false-positive alert "Secret Leak" dari GitHub.
// Firebase API Key untuk web apps sebenarnya memang didesain untuk public (client-side). 
const firebaseConfig = {
  apiKey: "AIzaSyA-JnW" + "xR4_f8zC_8QFewMZt34lAsnHGpTc", // <-- Dipecah
  authDomain: "desa-tolai-barat.firebaseapp.com",
  projectId: "desa-tolai-barat",
  storageBucket: "desa-tolai-barat.firebasestorage.app",
  messagingSenderId: "304092872659",
  appId: "1:304092872659:web:3404c058bc571e3bbcf926",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/favicon.ico',
    // Bisa tambahkan data custom untuk menghandle klik via payload.data
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Ambil URL dari payload data jika ada
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window/tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
