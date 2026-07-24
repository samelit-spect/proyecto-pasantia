import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/services/firebase';

export async function uploadPhoto(file: File, schoolId: string, date: string): Promise<string> {
  const filename = `${Date.now()}_${file.name}`;
  const path = `fotos/${schoolId}/${date}/${filename}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
  return path;
}

export async function getPhotoUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

export async function deletePhoto(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
