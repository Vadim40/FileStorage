export const environment = {
    production: false,
    PINATA_API_KEY:'0010c7415558890482f0',
    PINATA_SECRET_API_KEY : '483bb33b4c68b78f0d8b5bc42f95aa79f7e99433612a7eeb33989019f5a57792',    
    contractAddress: '0x761691B0ae50Eb593EfEd86261c9713Ab2147337',
    abiJson: [
      {
          "anonymous": false,
          "inputs": [
              {
                  "indexed": true,
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
              },
              {
                  "indexed": false,
                  "internalType": "uint256",
                  "name": "fileId",
                  "type": "uint256"
              },
              {
                  "indexed": false,
                  "internalType": "string",
                  "name": "fileHash",
                  "type": "string"
              }
          ],
          "name": "FileUploaded",
          "type": "event"
      },
      {
          "inputs": [
              {
                  "internalType": "address",
                  "name": "_owner",
                  "type": "address"
              },
              {
                  "internalType": "uint256",
                  "name": "_fileId",
                  "type": "uint256"
              }
          ],
          "name": "getFile",
          "outputs": [
              {
                  "internalType": "string",
                  "name": "",
                  "type": "string"
              },
              {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
              },
              {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
              }
          ],
          "stateMutability": "view",
          "type": "function"
      },
      {
          "inputs": [
              {
                  "internalType": "address",
                  "name": "_owner",
                  "type": "address"
              }
          ],
          "name": "getUserFiles",
          "outputs": [
              {
                  "internalType": "uint256[]",
                  "name": "",
                  "type": "uint256[]"
              },
              {
                  "internalType": "string[]",
                  "name": "",
                  "type": "string[]"
              }
          ],
          "stateMutability": "view",
          "type": "function"
      },
      {
          "inputs": [
              {
                  "internalType": "address",
                  "name": "_owner",
                  "type": "address"
              },
              {
                  "internalType": "uint256",
                  "name": "_fileId",
                  "type": "uint256"
              }
          ],
          "name": "isOwner",
          "outputs": [
              {
                  "internalType": "bool",
                  "name": "",
                  "type": "bool"
              }
          ],
          "stateMutability": "view",
          "type": "function"
      },
      {
          "inputs": [
              {
                  "internalType": "string",
                  "name": "_fileHash",
                  "type": "string"
              }
          ],
          "name": "uploadFile",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
      },
      {
          "inputs": [
              {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
              }
          ],
          "name": "userFileCount",
          "outputs": [
              {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
              }
          ],
          "stateMutability": "view",
          "type": "function"
      },
      {
          "inputs": [
              {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
              },
              {
                  "internalType": "uint256",
                  "name": "",
                  "type": "uint256"
              }
          ],
          "name": "userFiles",
          "outputs": [
              {
                  "internalType": "string",
                  "name": "fileHash",
                  "type": "string"
              },
              {
                  "internalType": "address",
                  "name": "owner",
                  "type": "address"
              },
              {
                  "internalType": "uint256",
                  "name": "timestamp",
                  "type": "uint256"
              }
          ],
          "stateMutability": "view",
          "type": "function"
      }
  ]
  };
  