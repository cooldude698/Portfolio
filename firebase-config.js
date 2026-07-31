// ==========================================================================
// AMAN JAIN PORTFOLIO - FIREBASE CLOUD FIRESTORE CONFIGURATION
// ==========================================================================

const firebaseConfig = {
  apiKey: "AIzaSyCo5FTR4E81A4cp9z-oUdojwX6uY_s2dLI",
  authDomain: "portfolio-95ba2.firebaseapp.com",
  projectId: "portfolio-95ba2",
  storageBucket: "portfolio-95ba2.firebasestorage.app",
  messagingSenderId: "183734204571",
  appId: "1:183734204571:web:4cc9baf9788e45b2242e3e",
  measurementId: "G-19HYLT4K9F"
};

// Initialize Firebase Cloud Firestore
let db = null;
if (typeof firebase !== 'undefined') {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    console.log("🔥 Firebase Cloud Firestore connected successfully (Project: portfolio-95ba2)!");
  } catch (e) {
    console.warn("Firebase initialization warning:", e);
  }
}

// Global Cloud Firestore Auth Credentials Sync Function
window.fetchCloudCredentials = async function() {
  if (!db) return null;
  try {
    const doc = await db.collection('settings').doc('admin_auth').get();
    if (doc.exists) {
      console.log("🔥 Live Admin credentials fetched from Cloud Firestore:", doc.data().user);
      return doc.data();
    }
  } catch (e) {
    console.warn("⚠️ Firestore auth fetch error (Check Firestore Security Rules in Firebase Console):", e);
  }
  return null;
};

window.saveCloudCredentials = async function(credsObj) {
  if (!db) return false;
  try {
    await db.collection('settings').doc('admin_auth').set(credsObj);
    console.log("🔥 Admin credentials synced live to Firebase Cloud Firestore:", credsObj.user);
    return true;
  } catch (e) {
    console.warn("⚠️ Firestore auth save error:", e);
    return false;
  }
};

// Global Cloud Firestore Projects Helper Functions
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
