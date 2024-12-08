import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PinataService {
  private pinataApiUrl = 'https://api.pinata.cloud/pinning';
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
            throw new Error('CID не найден в ответе.');
        }
    } catch (error) {
        throw new Error('Ошибка загрузки на Pinata: ' + error);
    }
}

  
    

async getFromPinata(cid: string): Promise<Blob> {
  const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
  try {
    const data = await firstValueFrom(
      this.http.get<Blob>(url, { responseType: 'blob' as 'json' })
    );
    return data;
  } catch (error) {
    throw new Error('Ошибка получения данных из Pinata: ' + error);
  }
}


}
