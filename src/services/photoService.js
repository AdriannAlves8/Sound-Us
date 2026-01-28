import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'photos';

export const getPhotos = async (albumId) => {
  try {
    // Removido orderBy da query para evitar necessidade de índice composto no Firebase
    const q = query(
      collection(db, COLLECTION_NAME), 
      where('albumId', '==', albumId)
    );
    const snapshot = await getDocs(q);
    const photos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Ordenação feita via JavaScript no cliente
    return photos.sort((a, b) => {
        if (a.data < b.data) return 1;
        if (a.data > b.data) return -1;
        return 0;
    });
  } catch (error) {
    console.error("Error fetching photos:", error);
    return [];
  }
};

// Converte arquivo para Base64 comprimido
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Comprime para JPEG com qualidade 0.7
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const uploadImage = async (fileOrUrl) => {
  if (!fileOrUrl) return null;
  
  // Se já for uma string (URL ou Base64), retorna ela mesma
  if (typeof fileOrUrl === 'string') {
    return fileOrUrl;
  }

  // Se for arquivo, converte para Base64
  try {
    return await compressImage(fileOrUrl);
  } catch (error) {
    console.error("Erro ao processar imagem:", error);
    return null;
  }
};

export const addPhoto = async (photoData) => {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), photoData);
  return docRef.id;
};

export const deletePhoto = async (id) => {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
}

export const updatePhoto = async (id, data) => {
  await updateDoc(doc(db, COLLECTION_NAME, id), data);
}

export const toggleFavoritePhoto = async (id, current) => {
  await updatePhoto(id, { favorito: !current });
}
