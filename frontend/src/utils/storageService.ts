import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

class StorageService {
  private static instance: StorageService;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async uploadImage(file: File, userId: string): Promise<string> {
    try {
      // Create a unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${userId}/${uuidv4()}.${fileExtension}`;
      
      // Create a reference to the file location
      const storageRef = ref(storage, fileName);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      console.log('Image uploaded successfully:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Extract the file path from the URL
      const filePath = imageUrl.split('/').slice(-2).join('/');
      const storageRef = ref(storage, filePath);
      
      // Delete the file
      await deleteObject(storageRef);
      
      console.log('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  async updateImage(oldImageUrl: string, newFile: File, userId: string): Promise<string> {
    try {
      // Delete the old image
      await this.deleteImage(oldImageUrl);
      
      // Upload the new image
      return await this.uploadImage(newFile, userId);
    } catch (error) {
      console.error('Error updating image:', error);
      throw error;
    }
  }
}

export default StorageService; 