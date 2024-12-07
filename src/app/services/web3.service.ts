import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { environment } from '../../environments/environment';
import { EncryptionService } from './encryption.service';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Web3Service {
  private web3: Web3 | undefined;
  private contract: any;

  constructor(private encryptionService: EncryptionService) {
    this.initializeContract();
  }

  private initializeContract(): void {
    this.web3 = (window as any).ethereum ? new Web3((window as any).ethereum) : undefined;
    if (this.web3) {
      this.contract = new this.web3.eth.Contract(environment.abiJson as AbiItem[], environment.contractAddress);
    }
  }

  async connectToMetaMask(): Promise<string> {
    if (!this.web3) {
      throw new Error('MetaMask не найден.');
    }
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    return 'MetaMask успешно подключен!';
  }

  async uploadEncryptedFile(fileContent: string, key: string): Promise<void> {
    if (!fileContent || !key) {
      alert('Введите содержимое файла и ключ шифрования.');
      return;
    }
  
    const encryptedData = this.encryptionService.encryptData(fileContent, key);
    console.log('Encrypted data:', encryptedData);
  
    const formData = new FormData();
    const file = new Blob([encryptedData], { type: 'text/plain' });
    formData.append('file', file, 'encrypted.txt');
  
    formData.forEach((value, key) => {
      console.log(key, value);
    });
  
    try {
      const cid = await this.encryptionService.uploadToPinata(formData);
      console.log('Successfully uploaded to Pinata. CID:', cid);
  
      const accounts = await this.getAccounts();
      const receipt = await this.contract.methods
        .uploadFile(cid)
        .send({ from: accounts[0] })
        .on('transactionHash', (hash: string) => {
          console.log('Transaction hash:', hash);
        });
  
      console.log('Transaction receipt:', receipt);
      alert('Файл успешно зашифрован и загружен!');
    } catch (error) {
      console.error(error);
      alert('Ошибка загрузки файла: ' + error);
    }
  }
  
  
  

  // Получение расшифрованных данных из IPFS
  async getDecryptedFile(owner: string, fileId: number, key: string): Promise<string> {
    try {
      // Получаем CID из контракта
      const fileData = await this.contract.methods.getFile(owner, fileId).call();
      console.log('Данные файла из контракта:', fileData);
  
      // Извлечение CID из результата
      const cid = fileData[0]; // Предполагаем, что CID находится в индексе 0
      if (typeof cid !== 'string') {
        throw new Error('Invalid CID format from contract');
      }
      // Получаем зашифрованные данные из Pinata
      const encryptedData: string = await this.encryptionService.getFromPinata(cid);
      console.log('Зашифрованные данные из Pinata:', encryptedData);
  
      // Расшифровываем данные
      const decryptedData: string = this.encryptionService.decryptData(encryptedData, key);
      console.log('Расшифрованные данные:', decryptedData);
  
      return decryptedData;
    } catch (error) {
      console.error('Ошибка в процессе получения расшифрованных данных:', error);
      throw new Error('Ошибка получения или расшифровки данных: ' + error);
    }
  }
  

  private async getAccounts(): Promise<string[]> {
    if (!this.web3) {
      throw new Error('Web3 не инициализирован. Подключите MetaMask.');
    }
    return await this.web3.eth.getAccounts();
  }

  async getUserFiles(owner: string): Promise<{ fileIds: string[]; fileHashes: string[] }> {
    const result = await this.contract.methods.getUserFiles(owner).call();
    return { fileIds: result[0], fileHashes: result[1] };
  }
}
