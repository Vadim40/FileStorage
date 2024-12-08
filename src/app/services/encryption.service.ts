import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  /**
   * Метод шифрования данных из файла.
   * @param file Файл, который нужно зашифровать.
   * @param key Ключ шифрования.
   * @returns Зашифрованные данные в виде Uint8Array.
   */
 /**
 * Метод шифрования данных из файла.
 * @param file Файл, который нужно зашифровать.
 * @param key Ключ шифрования.
 * @returns Зашифрованный файл с тем же именем.
 */
async encryptFile(file: File, key: string): Promise<File> {
  const fileContent = await this.readFile(file);

  // Шифруем содержимое файла
  const encryptedData = this.encryptData(fileContent, key);
  console.log(encryptedData);
  // Создаём новый файл с зашифрованным содержимым
  const encryptedFileName = `encrypted_${file.name}`;
  const encryptedFile = new File([encryptedData], encryptedFileName, {
      type: 'application/octet-stream',
  });

  return encryptedFile;
}


  /**
   * Метод расшифровки данных из файла.
   * @param file Зашифрованный файл.
   * @param key Ключ шифрования.
   * @returns Расшифрованное содержимое в виде строки.
   */

  /**
   * Метод для шифрования данных.
   * @param data Массив байтов для шифрования.
   * @param key Ключ шифрования.
   * @returns Зашифрованные данные в виде Uint8Array.
   */
  encryptData(data: Uint8Array, key: string): Uint8Array {
    const wordArray = CryptoJS.lib.WordArray.create(data);
    const encrypted = CryptoJS.AES.encrypt(wordArray, key);
    return this.wordArrayToUint8Array(encrypted.ciphertext);
  }

  /**
   * Метод для расшифровки данных.
   * @param encryptedData Зашифрованные данные в формате строки Base64.
   * @param key Ключ шифрования.
   * @returns Расшифрованное содержимое в виде строки.
   */
  async decryptData(encryptedData: Blob, key: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const encryptedText = reader.result as string;
          const bytes = CryptoJS.AES.decrypt(encryptedText, key);
          resolve(bytes.toString(CryptoJS.enc.Utf8));
        } catch (error) {
          reject(new Error('Ошибка расшифровки: ' + error));
        }
      };
      reader.onerror = (error) => reject(new Error('Ошибка при чтении файла: ' + error));
      reader.readAsDataURL(encryptedData);
    });
  }
  
  

  /**
   * Метод чтения файла и преобразования его в Uint8Array.
   * @param file Файл для чтения.
   * @returns Содержимое файла в виде Uint8Array.
   */
  private async readFile(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Преобразование WordArray в Uint8Array.
   * @param wordArray Данные CryptoJS в формате WordArray.
   * @returns Данные в формате Uint8Array.
   */
  private wordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
    const words = wordArray.words;
    const sigBytes = wordArray.sigBytes;

    const u8Array = new Uint8Array(sigBytes);
    for (let i = 0; i < sigBytes; i++) {
      u8Array[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    }

    return u8Array;
  }
}
