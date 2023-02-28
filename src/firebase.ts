// Import the functions you need from the SDKs you need
import { FirebaseApp, initializeApp } from 'firebase/app';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import { Analytics, getAnalytics } from 'firebase/analytics';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyCM1guxFUyx5Gs3QcWHiLVsV15G5Mefomg',
  authDomain: 'g0lem-b4371.firebaseapp.com',
  projectId: 'g0lem-b4371',
  storageBucket: 'g0lem-b4371.appspot.com',
  messagingSenderId: '719555132523',
  appId: '1:719555132523:web:5ddfdfb900de86699cc52e',
  measurementId: 'G-ZHKCVRXB5N',
};

let firebase_app: FirebaseApp | undefined;
let firebase_storage: FirebaseStorage | undefined;
let analytics: Analytics | undefined;

export function getFirebaseApp() {
  if (!firebase_app) {
    firebase_app = initializeApp(firebaseConfig);
  }
  return firebase_app;
}
export function getFirebaseStorage() {
  if (!firebase_storage) {
    firebase_storage = getStorage(getFirebaseApp());
  }
  return firebase_storage;
}

export function getAnalyticsObj() {
  if (!analytics) {
    analytics = getAnalytics(getFirebaseApp());
  }
  return analytics;
}
