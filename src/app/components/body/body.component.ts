import { Component, ChangeDetectionStrategy, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { BlobStorageService } from '../../service/blob-storage.service';
import { OperationService } from '../../operation.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BodyComponent implements OnInit {
  public data: any = ''
  public dataSource: any
  public displayedColumns: string[] = ['']
  public inprogressFlag = false
  public completeFlag = false
  public flag = false
  public dataSources = new MatTableDataSource<any>();
  isChecked: boolean = false;
  public operationFlag = false
  public incidentDetails = []

  constructor(private blobStorageService: BlobStorageService, private actionOperation: OperationService, private cdr: ChangeDetectorRef) {
  }

  checkForUpdates() {
    // Example: List blobs and monitor changes
    setInterval(() => {
      this.fetchJsonData().then(blobs => {
        console.log('Blobs:', blobs);
        // Compare with previous state or take appropriate action
      }).catch(err => {
        console.error('Error listing blobs:', err);
      });
    }, 5000); // Check every 5 seconds (adjust as needed)
  }

  ngOnInit(): void {
    this.checkForUpdates()
    // this.fetchJsonData()

  }
  async fetchJsonData() {
    await this.blobStorageService.main('example.json').then((data) => {
      if (data.length > 2) {
        this.data = JSON.parse(data)
        this.flag = true
        this.data = this.data.map((obj: any) => ({ ...obj, 'status': 'Not Started' }));
        this.data = this.data.map((obj: any) => ({ ...obj, 'resCode': '0' }));
        this.data = this.data.map((obj: any) => ({ ...obj, 'actionTaken': 'false' }));
        this.data = this.data.map((obj: any) => ({ ...obj, 'shortMessage': '' }));
        this.displayedColumns = ['SrNo', 'RCA_TimeStamp', 'Number', 'Short description', 'RCA_Group', 'Status'];
        for (let i = 0; i < this.data.length; i++) {
          var found = this.incidentDetails.filter((o) => o.Number == this.data[i].Number);
          // console.log(found);

          if (found.length > 0) {
            // Matching item found, do something if needed
          } else {
            // No matching item found, push this.data[i] to incidentDetails
            this.incidentDetails.push(this.data[i]);
          }
        }
        console.log(this.incidentDetails);
        this.dataSources.data = this.incidentDetails;

        this.cdr.detectChanges()
        if (this.isChecked) {
          for (var i = 0; i < this.incidentDetails.length; i++) {
            if (this.incidentDetails[i].status == 'Not Started') {
              this.operation(this.incidentDetails[i].Number)
            }
          }
        }
      }
    })
  }

  readonly dialog = inject(MatDialog);


  openDialog(incident: any) {
    console.log(incident)
    const incidentDetail = this.incidentDetails.filter((e: any) => e.Number == incident)
    const dialogRef = this.dialog.open(DialogComponent, {
      data: incidentDetail[0]
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
  operation(incidentNumber: any) {
    this.inprogressFlag = true
    this.incidentDetails = this.incidentDetails.map((obj: any) => {
      if (obj.Number == incidentNumber) {
        return { ...obj, 'status': 'inProgress' };
      }
      return obj;
    });
    this.dataSources.data = this.incidentDetails
    this.cdr.detectChanges()
    const incidentDetail = this.incidentDetails.filter((e: any) => e.Number == incidentNumber)
    console.log(incidentDetail);

    this.actionOperation.operationAction(incidentDetail).subscribe((data: any) => {
      console.log(data);
      if (data.status_code == 200) {
        this.incidentDetails = this.incidentDetails.map((obj: any) => {
          if (obj.Number == incidentNumber) {
            return { ...obj, 'status': 'Completed', 'resCode': data.status_code, 'restext': data.restext, 'actionTaken': 'true', 'User Email': 'maddixit@deloitte.com', 'Notified': 'Yes', 'Notification Time': new Date(), 'shortMessage': data.shortMessage };
          }
          return obj;
        });
        const details = {
          'Subject': incidentDetail[0].RCA_Group + " Request Completed",
          'To': 'maddixit@deloitte.com',
          'CC': 'arnmondal@deloitte.com',
          'Body': data.restext,
        }
        console.log(details);

        this.actionOperation.notifyUser(details).subscribe((data: any) => {
          console.log(data);
        })
      } else if (data == 0) {
        this.incidentDetails = this.incidentDetails.map((obj: any) => {
          if (obj.Number == incidentNumber) {
            return { ...obj, 'status': 'Completed', 'resCode': 10, 'restext': 'Not Configured yet. Please follow the manual step for now!', 'actionTaken': 'true', 'User Email': 'arnab.mondal@deloitte.com', 'Notified': 'No', 'Notification Time': '-' };
          }
          return obj;
        });
      }
      this.dataSources.data = this.incidentDetails
      this.cdr.detectChanges()
    },
      (error) => {
        console.error('Error occurred:', error);
        console.log(error)
        // Handle error, show error message to user, etc.
        let errorJsonString: any = this.captureErrorToJson(error);
        errorJsonString = JSON.parse(errorJsonString)
        console.log(errorJsonString)
        if (incidentDetail[0].RCA_Group == 'ADF Operation') {
          this.incidentDetails = this.incidentDetails.map((obj: any) => {
            if (obj.Number == incidentNumber) {
              return { ...obj, 'status': 'Completed', 'resCode': errorJsonString.ErrorCode, 'restext': "SPN doesn't have access to ADF. Need admin intervention.", 'actionTaken': 'true', 'User Email': 'arnab.mondal@deloitte.com', 'Notified': 'No', 'Notification Time': '-' };
            }
            return obj;
          });
        }
        this.dataSources.data = this.incidentDetails
        this.cdr.detectChanges()
      })
  }

  captureErrorToJson(errorMessage: string) {
    let errorJson = {
      ErrorCode: '',
      Message: '',
      Details: ''
    };

    // Split the error message into lines
    let lines = errorMessage.split('\n');

    // Iterate through each line and parse relevant information
    lines.forEach(line => {
      if (line.startsWith('Error Code:')) {
        errorJson.ErrorCode = line.split('Error Code:')[1].trim();
      } else if (line.startsWith('Message:')) {
        errorJson.Message = line.split('Message:')[1].trim();
      } else if (line.startsWith('Details:')) {
        errorJson.Details = line.split('Details:')[1].trim();
      }
    });
    return JSON.stringify(errorJson);
  }

}
