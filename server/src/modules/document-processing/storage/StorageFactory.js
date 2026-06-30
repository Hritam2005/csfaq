import { LocalStorage } from './LocalStorage.js';
// import { S3Storage } from './S3Storage.js'; // Future expansion

export class StorageFactory {
  static getProvider(type = 'local') {
    switch (type.toLowerCase()) {
      case 'local':
        return new LocalStorage();
      // case 's3':
      //   return new S3Storage();
      default:
        throw new Error(`Unsupported storage type: ${type}`);
    }
  }
}
