// lib/firebaseAdmin.ts
import * as admin from "firebase-admin";
import { cert } from "firebase-admin/app";

// Initialize Firebase Admin if it hasn't been initialized

if (!admin.apps.length) {
  try {
    const app = admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.NEXT_PUBLIC_FIREBASE_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
      } as admin.ServiceAccount),
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
  } catch (error) {
    console.log("Firebase admin initialization error", error);
  }
}

export default admin;
