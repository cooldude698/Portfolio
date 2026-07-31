// ==========================================================================
// AMAN JAIN PORTFOLIO - FIREBASE CLOUD FIRESTORE CONFIGURATION
// ==========================================================================
// Instructions for Visitors/Developers:
// Replace the placeholders below with your own Firebase Project configuration keys.

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_AUTH_DOMAIN",
  projectId: "YOUR_FIREBASE_PROJECT_ID",
  storageBucket: "YOUR_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "YOUR_FIREBASE_MESSAGING_SENDER_ID",
  appId: "YOUR_FIREBASE_APP_ID"
};

// Initialize Firebase Cloud Firestore
let db = null;
if (typeof firebase !== 'undefined') {
  try {
    if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.firestore();
      console.log("🔥 Firebase Cloud Firestore connected successfully!");
    } else {
      console.log("ℹ️ Firebase config placeholders detected. Using local fallback mode.");
    }
  } catch (e) {
    console.warn("Firebase initialization warning:", e);
  }
}

// Global Cloud Firestore Sync Helper Functions
window.fetchCloudProjects = async function() {
  if (!db) return null;
  try {
    const snapshot = await db.collection('projects').get();
    const projects = [];
    snapshot.forEach(doc => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    console.log(`🔥 Fetched ${projects.length} live projects from Firebase Cloud Firestore`);
    return projects.length > 0 ? projects : null;
  } catch (e) {
    console.warn("Firestore fetch warning:", e);
    return null;
  }
};

window.saveCloudProject = async function(projectObj) {
  if (!db) return false;
  try {
    const docId = projectObj.id || ('proj-' + Date.now());
    await db.collection('projects').doc(docId).set({
      ...projectObj,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    console.log("🔥 Project saved live to Firebase Cloud Firestore:", docId);
    return true;
  } catch (e) {
    console.error("Firestore save error:", e);
    return false;
  }
};

window.deleteCloudProject = async function(docId) {
  if (!db) return false;
  try {
    await db.collection('projects').doc(docId).delete();
    console.log("🔥 Project deleted from Firebase Cloud Firestore:", docId);
    return true;
  } catch (e) {
    console.error("Firestore delete error:", e);
    return false;
  }
};
