import { db } from './firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, query, orderBy } from 'firebase/firestore';

const COLLECTION_NAME = 'albums';

export const getAlbums = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('dataCriacao', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching albums:", error);
    return [];
  }
};

export const getAlbum = async (id) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    throw new Error("Album not found");
  }
};

export const createAlbum = async (albumData) => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...albumData,
    dataCriacao: new Date().toISOString(),
    favorito: false
  });
  return docRef.id;
};

export const updateAlbum = async (id, albumData) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, albumData);
};

export const toggleFavorite = async (id, currentStatus) => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, { favorito: !currentStatus });
};
