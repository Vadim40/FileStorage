import { Component, OnInit } from '@angular/core';
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
  encryptionKey: string = '';
  decryptionKey: string = '';
  ownerAddress: string = '';
  fileId: number | null = null;
  fileData: any = null;
  userFiles: { fileIds: string[]; fileHashes: string[] } | null = null;
  accounts: string[] = []; // Array to hold MetaMask accounts
  selectedFile: File | null = null; // Variable to hold the selected file
  fileName: string = '';     // Имя выбранного файла
  
  constructor(private web3Service: Web3Service , private encryptionService : EncryptionService) {}
 
  ngOnInit(): void {
    this.connectMetaMask(); // Automatically connect and fetch accounts
  }

  async connectMetaMask(): Promise<void> {
    try {
      const message = await this.web3Service.connectToMetaMask();
      alert(message);
      
      // Fetch available accounts
      this.accounts = await this.web3Service.getAccounts();
      if (this.accounts.length > 0) {
        this.ownerAddress = this.accounts[0]; // Set the default selected account
      }
    } catch (error) {
      alert('Ошибка подключения к MetaMask: ' + error);
    }
  }

  

  // Upload encrypted file to blockchain or server
  async uploadFile(): Promise<void> {
    if (!this.selectedFile || !this.encryptionKey) {
      console.log(this.selectedFile)
        alert('Пожалуйста, выберите файл и введите ключ шифрования.');
        return;
    }

    try {
      
        const encryptedFile= this.encryptionService.encryptFile(this.selectedFile, this.encryptionKey);
        // Загрузка файла через сервис
        await this.web3Service.uploadEncryptedFile(await encryptedFile,this.selectedFile.name, this.selectedFile.type);

        alert('Файл успешно зашифрован и загружен!');
    } catch (error) {
        console.error('Ошибка загрузки файла:', error);
        alert('Ошибка загрузки файла: ' + error);
    }
}

  // Get decrypted file from blockchain or server
  async getFile(): Promise<void> {
    if (!this.ownerAddress || this.fileId === null || !this.decryptionKey) {
      alert('Введите адрес владельца, ID файла и ключ расшифровки.');
      return;
    }
  
    try {
      // 1. Получение зашифрованных данных и метаданных
      const fileData = await this.web3Service.getDecryptedFile(this.ownerAddress, this.fileId);
  
      // 2. Извлечение данных
      const { encryptedContent, metadata } = fileData;
  
      // 3. Расшифровка файла (ожидание завершения промиса)
      const decryptedContent = await this.encryptionService.decryptData(encryptedContent, this.decryptionKey);
  
      // 4. Преобразуем расшифрованные данные в Blob
      const fileBlob = new Blob([decryptedContent], { type: metadata.mimeType || 'application/octet-stream' });
      const fileUrl = URL.createObjectURL(fileBlob);
  
      // 5. Скачивание файла
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = metadata.originalName || 'decrypted_file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      alert(`Файл "${metadata.originalName}" успешно расшифрован и предоставлен для скачивания!`);
    } catch (error) {
      console.error('Ошибка получения или расшифровки файла:', error);
      alert('Ошибка получения файла: ' + error);
    }
  }
  



  // Get user's files based on their address
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
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file; 
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fileContent = e.target.result;
      };
      reader.readAsText(file);
    }
  }
  
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    const dropArea = event.target as HTMLElement;
    dropArea.classList.add('dragover');
  }
  
  onDragLeave(event: DragEvent): void {
    const dropArea = event.target as HTMLElement;
    dropArea.classList.remove('dragover');
  }
  
  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) {
      this.selectedFile = file; 
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.fileContent = e.target.result;
      };
      reader.readAsText(file);
    }
  }
  
  
  clearFile(): void {
    this.fileContent = '';
    this.fileName = '';
  }
}
