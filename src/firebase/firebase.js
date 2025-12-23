import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCpMaFwayMgTG98-TOee8jW3Jreq6I3MPc",
  authDomain: "wcg-new-year.firebaseapp.com",
  projectId: "wcg-new-year",
  storageBucket: "wcg-new-year.appspot.com",
  messagingSenderId: "250664588308",
  appId: "1:250664588308:web:31cf6da0644100fd508301",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);