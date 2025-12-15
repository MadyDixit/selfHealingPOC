import { Component, ChangeDetectionStrategy, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { IncidentService } from '../../service/blob-storage.service';
import { OperationService } from '../../operation.service';
import { MatTableDataSource } from '@angular/material/table';
import * as Papa from 'papaparse';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BodyComponent implements OnInit {
  displayedColumns: string[] = ['SrNo', 'Number', 'Short description'];
  dataSource = new MatTableDataSource<any>();
  incidentDetails: any[] = [];

  flag = false;
  pendingIncidentFromUrl: string | null = null;

  private dialogOpened = false;

  readonly dialog = inject(MatDialog);
  loading = true;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private incidentService: IncidentService,
    private operationService: OperationService,
    private cdr: ChangeDetectorRef
  ) { }

  // 🚀 Init
  ngOnInit(): void {
    // Listen to route param changes
    this.route.paramMap.subscribe(params => {
      this.pendingIncidentFromUrl = params.get('incidentNumber');
      this.refreshIncidents();
    });
  }

  // 🔄 Load incidents
  refreshIncidents(): void {
    this.incidentService.getIncidents().subscribe({
      next: (csvText: string) => {
        const parsed = this.parseCsv(csvText);

        const filtered = parsed.filter(row =>
          row['Middleware Logs'] &&
          row['Middleware Logs'] !== 'None' &&
          row['Middleware Logs'] !== 'null'
        );

        filtered.forEach(row => {
          if (!this.incidentDetails.some(i => i.Number === row.Number)) {
            this.incidentDetails.push({
              ...row,
              status: 'Not Started',
              actionTaken: false
            });
          }
        });

        this.dataSource.data = [...this.incidentDetails];
        this.flag = true;
        this.loading = false;
        this.cdr.markForCheck();

        // 🔑 Route-driven dialog
        this.openDialogFromRoute();
      },
      error: err => console.error(err)
    });
  }

  // 🧭 Open dialog ONLY from route
  private openDialogFromRoute(): void {
    if (!this.pendingIncidentFromUrl || this.dialogOpened) return;

    const data = this.incidentDetails.find(
      i => i.Number === this.pendingIncidentFromUrl
    );

    if (!data) return;

    this.dialogOpened = true;

    const dialogRef = this.dialog.open(DialogComponent, {
      data,
      width: '85%'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.dialogOpened = false;
      this.router.navigate(['/']); // reset URL
    });
  }

  // 🖱️ Row click → ONLY navigate
  openDialog(incidentNumber: string): void {
    this.router.navigate(['/incidents', incidentNumber]);
  }

  // 🧩 CSV parser
  private parseCsv(csv: string): any[] {
    const result = Papa.parse(csv, {
      header: true,
      skipEmptyLines: true
    });

    if (result.errors.length) {
      console.error('CSV parse errors:', result.errors);
    }

    return result.data as any[];
  }
}
