  import { Component } from '@angular/core';
  import { Web3Service } from '../../services/web3.service';
  import { FormsModule } from '@angular/forms';
  import { CommonModule } from '@angular/common';

  @Component({
    selector: 'app-contract-interaction',
    templateUrl: './contract-interaction.component.html',
    styleUrls: ['./contract-interaction.component.css'],
    standalone: true,
    imports: [FormsModule, CommonModule],
  })
  export class ContractInteractionComponent {
    fileContent: string = '';
    encryptionKey: string = '';
    decryptionKey: string = '';
    ownerAddress: string = '';
    fileId: number | null = null;
    fileData: any = null;
    userFiles: { fileIds: string[]; fileHashes: string[] } | null = null;

    constructor(private web3Service: Web3Service) {}

    async connectMetaMask(): Promise<void> {
      try {
        const message = await this.web3Service.connectToMetaMask();
        alert(message);
      } catch (error) {
        alert('Ошибка подключения: ' + error);
      }
    }

    async uploadEncryptedFile(): Promise<void> {
      if (!this.fileContent || !this.encryptionKey) {
        alert('Введите содержимое файла и ключ шифрования.');
        return;
      }
      try {
        await this.web3Service.uploadEncryptedFile(this.fileContent, this.encryptionKey);
        alert('Файл успешно зашифрован и загружен!');
      } catch (error) {
        console.error(error);
        alert('Ошибка загрузки файла: ' + error);
      }
    }

    async getDecryptedFile(): Promise<void> {
      if (!this.ownerAddress || this.fileId === null || !this.decryptionKey) {
        alert('Введите адрес владельца, ID файла и ключ расшифровки.');
        return;
      }
      try {
        this.fileData = await this.web3Service.getDecryptedFile(this.ownerAddress, this.fileId, this.decryptionKey);


      } catch (error) {
        alert('Ошибка получения файла: ' + error);
      }
    }

    async getUserFiles(): Promise<void> { 
      if (!this.ownerAddress) {
        alert('Введите адрес владельца.');
        return;
      }
      try {
        this.userFiles = await this.web3Service.getUserFiles(this.ownerAddress);
      } catch (error) {
        alert('Ошибка получения файлов: ' + error);
      }
    }
  }
