import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCHbNAxUesQHSvj_T6AfmoX8aoJcI_mKVE",
  authDomain: "casal-memorias.firebaseapp.com",
  projectId: "casal-memorias",
  storageBucket: "casal-memorias.firebasestorage.app",
  messagingSenderId: "84131892169",
  appId: "1:84131892169:web:3c8ecc8001644c8fe6f618",
  measurementId: "G-FXMJ1H4TW3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
// Storage removido temporariamente para evitar problemas de plano
// As imagens serão salvas como Base64 diretamente no Firestore
export const storage = null; 
