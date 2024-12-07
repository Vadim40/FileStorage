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
  
    const formData = new FormData();
    const file = new Blob([encryptedData], { type: 'text/plain' });
    formData.append('file', file, 'encrypted.txt');
  
    try {
      const cid = await this.encryptionService.uploadToPinata(formData);
      const accounts = await this.getAccounts();
      const receipt = await this.contract.methods
    .uploadFile(cid)
    .send({ from: accounts[0] });

    console.log('Transaction hash:', receipt.transactionHash);

      console.log('Transaction receipt:', receipt);
      alert('Файл успешно зашифрован и загружен!');
    } catch (error) {
      console.error(error);
      alert('Ошибка загрузки файла: ' + error);
    }
  }
  
  async getDecryptedFile(owner: string, fileId: number, key: string): Promise<string> {
    try {

      const fileData = await this.contract.methods.getFile(owner, fileId).call();
      const cid = fileData[0]; 
      if (typeof cid !== 'string') {
        throw new Error('Invalid CID format from contract');
      }
     
      const encryptedData: string = await this.encryptionService.getFromPinata(cid);
      const decryptedData: string = this.encryptionService.decryptData(encryptedData, key);
  
      return decryptedData;
    } catch (error) {
      throw new Error('Ошибка получения или расшифровки данных: ' + error);
    }
  }
  

  async getAccounts(): Promise<string[]> {
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
