import { ChangeDetectionStrategy, Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent {
  public incidentDetails = ['Description', 'Due date', 'Number', 'Opened', 'Prospective Resolutions', 'RCA_Group', 'RCA_TimeStamp', 'Similar_IDs', 'Self_Healing_Action']
  public activityDetails = ['restext', 'resCode', 'Number', 'User Email', 'Notified', 'Notification Time', 'Self_Healing_Action']

  // 🔹 Middleware table
  displayedMiddlewareColumns: string[] = [
    'step_no',
    'title',
    'description',
    'system',
    'execution_type',
    'status',
    'timestamp'
  ];

  middlewareDataSource = new MatTableDataSource<any>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    console.log('Dialog Data:', data);

    const rawLogs = data?.['Middleware Logs'];

    if (!rawLogs) {
      return;
    }

    try {
      // Case 1: Already object (API / non-CSV)
      if (typeof rawLogs === 'object' && rawLogs.steps) {
        this.middlewareDataSource.data = rawLogs.steps;
      }

      // Case 2: CSV string → parse JSON
      if (typeof rawLogs === 'string') {
        const parsed = JSON.parse(rawLogs.replace(/'/g, '"'));
        this.middlewareDataSource.data = parsed.steps || [];
      }

    } catch (err) {
      console.error('Failed to parse Middleware Logs:', err);
      this.middlewareDataSource.data = [];
    }
  }

  mapToSearchIncident(key: any) {
    return this.incidentDetails.indexOf(key) != -1
  }
  mapToSearchActivity(key: any) {
    return this.activityDetails.indexOf(key) != -1
  }
  hasMiddlewareLogs(): boolean {
    return this.middlewareDataSource.data.length > 0;
  }
}
