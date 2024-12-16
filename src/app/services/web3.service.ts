import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { environment } from '../../environments/environment';
import { EncryptionService } from './encryption.service';
import { PinataService } from './pinata.service';

@Injectable({
  providedIn: 'root',
})
export class Web3Service {
  private web3: Web3 | undefined;
  private contract: any;

  constructor(
    private encryptionService: EncryptionService,
    private pinataService: PinataService
  ) {
    this.initializeContract();
  }

  private initializeContract(): void {
    this.web3 = (window as any).ethereum ? new Web3((window as any).ethereum) : undefined;
    if (this.web3) {
      this.contract = new this.web3.eth.Contract(
        environment.abiJson as AbiItem[],
        environment.contractAddress
      );
    }
  }

  async connectToMetaMask(): Promise<string> {
    if (!this.web3) {
      throw new Error('MetaMask не найден.');
    }
    await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
    return 'MetaMask успешно подключен!';
  }

  async uploadEncryptedFile(fileContent: string, fileName: string): Promise<void> {
    const formData = new FormData();
    const file = new Blob([fileContent], { type: 'text/plain' });
    formData.append('file', file, fileName);

    try {
      // Загрузка файла на Pinata
      const cid = await this.pinataService.uploadToPinata(formData);
      const accounts = await this.getAccounts();

      // Вызов uploadFile с cid и fileName
      await this.contract.methods.uploadFile(cid, fileName).send({ from: accounts[0] });
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
    }
  }

  async getDecryptedFile(fromAddress: string, fileId: number): Promise<{ fileContent: string; fileName: string }> {
    try {
      // Получение данных файла с помощью getFile
      const fileData = await this.contract.methods.getFile(fromAddress, fileId).call();
      const cid = fileData[0]; // fileCid
      const fileName = fileData[1]; // fileName

      // Загрузка зашифрованного содержимого файла с Pinata
      const encryptedData: string = await this.pinataService.getFromPinata(cid);

      return { fileContent: encryptedData, fileName };
    } catch (error) {
      throw new Error('Ошибка получения данных файла: ' + error);
    }
  }

  async deleteFile(fileId: number, fromAddress: string): Promise<void> {
    try {
      // Удаление файла с использованием контракта
      await this.contract.methods.deleteFile(fileId).send({ from: fromAddress });
      console.log(`Файл с ID ${fileId} успешно удалён с адреса ${fromAddress}`);
    } catch (error) {
      console.error('Ошибка удаления файла:', error);
      throw new Error('Удаление невозможно. Проверьте права доступа.');
    }
  }
  
  async getUserFiles(fromAddress: string): Promise<
    { fileIds: string[]; fileNames: string[]; timestamps: string[] }
  > {
    try {
      // Получение списка файлов пользователя
      const result = await this.contract.methods.getUserFiles(fromAddress).call();
      return {
        fileIds: result[0], // fileIds
        fileNames: result[1], // fileCids
        timestamps: result[2], // timestamps
      };
    } catch (error) {
      console.error('Ошибка получения файлов пользователя:', error);
      throw error;
    }
  }

  async getAccounts(): Promise<string[]> {
    if (!this.web3) {
      throw new Error('Web3 не инициализирован. Подключите MetaMask.');
    }
    return await this.web3.eth.getAccounts();
  }
}
