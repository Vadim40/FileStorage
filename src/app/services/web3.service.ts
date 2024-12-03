import { Injectable } from '@angular/core';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Web3Service {
  private web3: Web3 | undefined;
  private contract: any;

  constructor() {
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

 
  async uploadFile(fileContent: string): Promise<any> {
    try {
      const accounts = await this.getAccounts();
      await this.contract.methods.uploadFile(fileContent).send({ from: accounts[0] });
      console.log('Файл загружен:', fileContent);
      return fileContent;
    } catch (error) {
      throw new Error('Ошибка загрузки файла в контракт: ' + error);
    }
  }

 
  async getFile(owner: string, fileId: number): Promise<any> {
    try {
      const fileContent = await this.contract.methods.getFile(owner, fileId).call();
      console.log('Сырые данные файла из контракта:', fileContent);
      return fileContent;
    } catch (error) {
      throw new Error('Ошибка получения данных из контракта: ' + error);
    }
  }
  

  private async getAccounts(): Promise<string[]> {
    if (!this.web3) {
      throw new Error('Web3 не инициализирован. Подключите MetaMask.');
    }
    return await this.web3.eth.getAccounts();
  }

  async getUserFiles(owner: string): Promise<{ fileIds: string[]; fileHashes: string[] }> {
    try {
      const result = await this.contract.methods.getUserFiles(owner).call();
      return { fileIds: result[0], fileHashes: result[1] };
    } catch (error) {
      throw new Error('Ошибка получения файлов пользователя: ' + error);
    }
  }
}
