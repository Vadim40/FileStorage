import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PinataService {
  private apiKey: string =environment.PINATA_API_KEY;
  private apiSecret: string =environment.PINATA_SECRET_API_KEY;

  constructor(private http: HttpClient) {
   
  }
  async uploadToPinata(formData: FormData): Promise<string> {
    const headers = new HttpHeaders({
      pinata_api_key: this.apiKey,
      pinata_secret_api_key: this.apiSecret,
    });
  
    try {

      const response = await this.http
        .post<any>('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, { headers })
        .toPromise();
  
      if (response && response.IpfsHash) {
        return response.IpfsHash;
      } else {
        throw new Error('CID not found in response.');
      }
    } catch (error) {
      throw new Error('Error uploading to Pinata: ' + error);
    }
  }
  
    

  async getFromPinata(cid: string): Promise<string> {
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
  
    try {
      const data = await firstValueFrom(
        this.http.get<string>(url, { responseType: 'text' as 'json' })
      );
      return data;
    } catch (error) {
      throw new Error('Ошибка получения данных из Pinata: ' + error);
    }
  }
}
