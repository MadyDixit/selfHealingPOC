import { Injectable } from '@angular/core';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';

@Injectable({
  providedIn: 'root'
})
export class BlobStorageService {

  private accountName = 'staselfhealingpoc';
  private containerName = 'root';

  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;
  private incidentDetails: any = '';

  constructor() {
    // Replace with your SAS token for the container or blob
    const sasToken = "sv=2024-11-04&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2026-03-31T15:45:46Z&st=2025-10-09T07:30:46Z&spr=https&sig=F6tkyemsBk3VvdTJpv%2By8ICNY6toPhzwFsFhyiLiXfY%3D";
    const blobServiceClient = new BlobServiceClient(
      `https://${this.accountName}.blob.core.windows.net?${sasToken}`
    );
    this.blobServiceClient = blobServiceClient;
    this.containerClient = this.blobServiceClient.getContainerClient(this.containerName);
  }


  async main(blobName: string) {
    // if (this.incidentDetails == '') {

    const blobClient = this.containerClient.getBlobClient(blobName);
    // console.log(blobClient);

    try {
      // Download blob content
      const downloadBlockBlobResponse: any = await blobClient.download();
      const downloaded = this.blobToString(await downloadBlockBlobResponse.blobBody);
      // console.log("Downloaded blob content", downloaded);
      this.incidentDetails = downloaded
      return this.incidentDetails
    } catch (error) {
      console.error("Error downloading blob:", error);
    }
    // } else {
    //   return this.incidentDetails
    // }
  }

  async blobToString(blob: Blob): Promise<string> {
    const fileReader = new FileReader();

    return new Promise<string>((resolve, reject) => {
      fileReader.onloadend = (ev: ProgressEvent<FileReader>) => {
        if (ev.target && typeof ev.target.result === 'string') {
          resolve(ev.target.result);
        } else {
          reject(new Error('Failed to read blob as string.'));
        }
      };

      fileReader.onerror = () => {
        fileReader.abort();
        reject(new Error('Failed to read blob as string.'));
      };

      fileReader.readAsText(blob);
    });
  }
}
