import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { environment } from '../../environments/environment';
import { EncryptionService } from './encryption.service';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { PinataService } from './pinata.service';

@Injectable({
  providedIn: 'root',
})
export class Web3Service {
  private web3: Web3 | undefined;
  private contract: any;

  constructor(private pinataService : PinataService) {
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

  async uploadEncryptedFile(file: File, originalName: string, mimeType: string): Promise<void> {
    try {
        // Метаданные для Pinata
        const metadata = {
            name: `encrypted_${originalName}`,
            keyvalues: {
                originalName: originalName,
                mimeType: mimeType,
            },
        };

        // Формирование FormData
        const formData = this.prepareFormData(file, metadata);

        // Загрузка на Pinata
        const cid = await this.pinataService.uploadToPinata(formData);

        // Сохранение CID в контракте
        const accounts = await this.getAccounts();
        const receipt = await this.contract.methods.uploadFile(cid).send({ from: accounts[0] });

        console.log('Файл успешно сохранен в контракте. Транзакция:', receipt.transactionHash);
    } catch (error) {
        throw new Error('Ошибка при загрузке файла: ' + error);
    }
}


prepareFormData(file: File, metadata: any): FormData {
  const formData = new FormData();
  formData.append('file', file, metadata.name);
  formData.append('pinataMetadata', JSON.stringify(metadata));
  return formData;
}


  
async getDecryptedFile(owner: string, fileId: number): Promise<{ encryptedContent: Blob; metadata: any }> {
  try {
      // Получаем данные из контракта
      const fileData = await this.contract.methods.getFile(owner, fileId).call();

      const cid = fileData[0]; // CID, который был сохранен в контракте
      const metadataJson = fileData[1]; // Метаданные из контракта (если они были сохранены там)

      if (typeof cid !== 'string') {
          throw new Error('Invalid CID format from contract');
      }

      if (typeof metadataJson !== 'string') {
          throw new Error('Invalid metadata format from contract');
      }

      // Получаем зашифрованное содержимое с Pinata (Blob)
      const encryptedContent = await this.pinataService.getFromPinata(cid);

      // Парсим метаданные
      const metadata = JSON.parse(metadataJson);

      return { encryptedContent, metadata };
  } catch (error) {
      throw new Error('Ошибка получения данных: ' + error);
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
