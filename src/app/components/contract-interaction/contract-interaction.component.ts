import { Component, OnInit, ViewChild } from '@angular/core';
import { Web3Service } from '../../services/web3.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EncryptionService } from '../../services/encryption.service';

@Component({
  selector: 'app-contract-interaction',
  templateUrl: './contract-interaction.component.html',
  styleUrls: ['./contract-interaction.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class ContractInteractionComponent implements OnInit {
  fileContent: string = '';
  encryptKey: string = '';
  decryptKey: string = '';
  ownerAddress: string = '';
  fileId: number | null = null;
  file: any = null;
  userFiles: { 
    fileIds: string[]; 
    fileNames: string[]; 
    timestamps: string[]; 
  } | null = null;
    accounts: string[] = [];

  selectedFile: File | null = null;
  selectedEncryptKeyFile: File | null = null;
  selectedDecryptKeyFile: File | null = null;

  @ViewChild('fileInput') fileInput: any;
  @ViewChild('encryptKeyFileInput') encryptKeyFileInput: any;
  @ViewChild('decryptKeyFileInput') decryptKeyFileInput: any;

  constructor(
    private web3Service: Web3Service,
    private encryptionService: EncryptionService
  ) {}

  ngOnInit(): void {
    this.connectMetaMask();
  }

  async connectMetaMask(): Promise<void> {
    try {
      const message = await this.web3Service.connectToMetaMask();
      alert(message);

      this.accounts = await this.web3Service.getAccounts();
      if (this.accounts.length > 0) {
        this.ownerAddress = this.accounts[0];
      }
    } catch (error) {
      alert('Ошибка подключения к MetaMask: ' + error);
    }
  }

  // Обработчики для загрузки файлов
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.fileContent = reader.result as string;
      };
      reader.readAsText(file);
    } else {
      alert('Пожалуйста, выберите текстовый файл (.txt).');
    }
  }

  onEncryptKeyFileChange(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {
      this.selectedEncryptKeyFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.encryptKey = reader.result as string;
      };
      reader.readAsText(file);
    } else {
      alert('Пожалуйста, выберите текстовый файл для ключа шифрования.');
    }
  }

  onDecryptKeyFileChange(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {
      this.selectedDecryptKeyFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.decryptKey = reader.result as string;
        console.log(this.decryptKey);
      };
      reader.readAsText(file);
    } else {
      alert('Пожалуйста, выберите текстовый файл для ключа дешифрования.');
    }
  }

  // Метод для удаления выбранного файла
  removeFile(fileType: string): void {
    if (fileType === 'file') {
      this.selectedFile = null;
      this.fileContent = '';
      this.fileInput.nativeElement.value = '';  // Сбрасываем поле input
    } else if (fileType === 'encryptKey') {
      this.selectedEncryptKeyFile = null;
      this.encryptKey = '';
      this.encryptKeyFileInput.nativeElement.value = '';  // Сбрасываем поле input
    } else if (fileType === 'decryptKey') {
      this.selectedDecryptKeyFile = null;
      this.decryptKey = '';
      this.decryptKeyFileInput.nativeElement.value = '';  // Сбрасываем поле input
    }
  }

  async uploadEncryptedFile(): Promise<void> {
    if (!this.fileContent || !this.encryptKey) {
      alert('Пожалуйста, загрузите файл и ключ шифрования.');
      return;
    }
    try {
      const encryptedData = this.encryptionService.encryptData(this.fileContent, this.encryptKey);
      await this.web3Service.uploadEncryptedFile(encryptedData, this.selectedFile!.name);
      alert('Файл успешно зашифрован и загружен!');
    } catch (error) {
      console.error(error);
      alert('Ошибка загрузки файла: ' + error);
    }
  }

  async getDecryptedFile(): Promise<void> {
    if (!this.ownerAddress || this.fileId === null || !this.decryptKey) {
      alert('Пожалуйста, введите адрес владельца, ID файла и ключ расшифровки.');
      return;
    }
    try {
      this.file = await this.web3Service.getDecryptedFile(this.ownerAddress, this.fileId);
      console.log(this.file);
  
  
      const decryptedData = this.encryptionService.decryptData(this.file.fileContent, this.decryptKey);
      console.log(decryptedData);
  
      const blob = new Blob([decryptedData], { type: 'application/octet-stream' });
  
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `file_${this.file.fileName}.txt`; 
      a.click();
  
      window.URL.revokeObjectURL(url);
  
    } catch (error) {
      alert('Ошибка получения файла: ' + error);
    }
  }
  

  async getUserFiles(): Promise<void> {
    if (!this.ownerAddress) {
      alert('Пожалуйста, введите адрес владельца.');
      return;
    }
    try {
      this.userFiles = await this.web3Service.getUserFiles(this.ownerAddress);
    } catch (error) {
      alert('Ошибка получения файлов: ' + error);
    }
  }
  async deleteFile(fileId: string): Promise<void> {
    try {
      await this.web3Service.deleteFile(Number(fileId), this.ownerAddress); 
      alert(`Файл с ID ${fileId} успешно удалён.`);
      this.getUserFiles();  
    } catch (error) {
      alert('Ошибка удаления файла: ' + error);
    }
  }
}
