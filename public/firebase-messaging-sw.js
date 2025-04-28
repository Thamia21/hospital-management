importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyCmkdIhHv2_UBtFMedXZKoetSjHWcODybM',
  authDomain: 'hospital-management-syst-c8311.firebaseapp.com',
  projectId: 'hospital-management-syst-c8311',
  storageBucket: 'hospital-management-syst-c8311.firebasestorage.app',
  messagingSenderId: '712348029073',
  appId: '1:712348029073:web:b48d8e44e7c1ca4e166f30',
  measurementId: 'G-C06GQNF19H'
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png',
    badge: '/badge.png',
    tag: payload.data?.type || 'default',
    data: payload.data,
    actions: [
      {
        action: 'view',
        title: 'View Details',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window/tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    // Get new subscription
    registration.pushManager.subscribe({ userVisibleOnly: true })
      .then((subscription) => {
        console.log('New subscription:', subscription);
        // Here you would typically send the new subscription to your server
      })
  );
});
