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
  ownerAddress: string = '';
  fileId: number | null = null;
  fileData: string | null = null;
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

  async uploadFile(): Promise<void> {
    if (!this.fileContent) {
      alert('Введите содержимое файла.');
      return;
    }
    try {
      const result = await this.web3Service.uploadFile(this.fileContent);
      alert(`Файл успешно загружен: ${result}`);
    } catch (error) {
      console.error(error);
      alert('Ошибка загрузки файла: ' + error);
    }
  }
  async getFile(): Promise<void> {
    if (!this.ownerAddress || this.fileId === null) {
      alert('Введите адрес владельца и ID файла.');
      return;
    }
    try {
      const rawFileData = await this.web3Service.getFile(this.ownerAddress, this.fileId);
  
    
      const sanitizedData = JSON.parse(
        JSON.stringify(rawFileData, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        )
      );
  
      this.fileData = sanitizedData; 
      console.log('Данные файла:', this.fileData);
    } catch (error) {
      console.error(error);
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
      console.log('Файлы пользователя:', this.userFiles);
    } catch (error) {
      console.error(error);
      alert('Ошибка получения файлов пользователя: ' + error);
    }
  }
}
