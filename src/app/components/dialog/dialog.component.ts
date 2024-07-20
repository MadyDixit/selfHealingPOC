import { ChangeDetectionStrategy, Component, Inject, inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent {
  public incidentDetails = ['Description', 'Due date', 'Number', 'Opened', 'Prospective Resolutions', 'RCA_Group', 'RCA_TimeStamp', 'Similar_IDs','State'] 
  public activityDetails = ['restext', 'resCode', 'Number', 'User Email', 'Notified', 'Notification Time','status'] 
  constructor(@Inject(MAT_DIALOG_DATA) public data: any){
    console.log(data);
    
  }
  mapToSearchIncident(key:any){
    return this.incidentDetails.indexOf(key) != -1
  }
  mapToSearchActivity(key:any){
    return this.activityDetails.indexOf(key) != -1
  }
}
