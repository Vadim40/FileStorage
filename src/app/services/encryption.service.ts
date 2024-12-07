import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, firstValueFrom, map, Observable, throwError } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  private pinataApiUrl = 'https://api.pinata.cloud/pinning';
  private apiKey: string =environment.PINATA_API_KEY;
  private apiSecret: string =environment.PINATA_SECRET_API_KEY;

  constructor(private http: HttpClient) {
   
  }

  encryptData(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  decryptData(encryptedData: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async uploadToPinata(formData: FormData): Promise<string> {
    if (!this.apiKey || !this.apiSecret) {
      console.error('Pinata API keys missing.');
      throw new Error('API keys for Pinata are not configured.');
    }
  
    console.log('API Key:', this.apiKey);
    console.log('API Secret:', this.apiSecret);
  
    const headers = new HttpHeaders({
      pinata_api_key: this.apiKey,
      pinata_secret_api_key: this.apiSecret,
    });
  
    try {
      console.log('Sending file to Pinata:', formData);
      formData.forEach((value, key) => {
        console.log(key, value);
      });
  
      const response = await this.http
        .post<any>('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, { headers })
        .toPromise();
  
      console.log('Response Status:', response.status); // Статус ответа
      console.log('Full Response:', response); // Весь ответ
  
      if (response && response.IpfsHash) {
        return response.IpfsHash;
      } else {
        throw new Error('CID not found in response.');
      }
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
      throw new Error('Error uploading to Pinata: ' + error);
    }
  }
  
    

  async getFromPinata(cid: string): Promise<string> {
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
    console.log('Получение данных из Pinata по CID:', cid);
  
    try {
      const data = await firstValueFrom(
        this.http.get<string>(url, { responseType: 'text' as 'json' })
      );
      console.log('Данные, полученные из Pinata:', data);
      return data;
    } catch (error) {
      console.error('Ошибка при получении данных из Pinata:', error);
      throw new Error('Ошибка получения данных из Pinata: ' + error);
    }
  }
  
}

