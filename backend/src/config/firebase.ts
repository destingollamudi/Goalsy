import * as admin from 'firebase-admin';
import * as path from 'path';

// Path to your service account key
const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

// Export services we'll use
export const db = admin.firestore();
export const auth = admin.auth();
export { admin };