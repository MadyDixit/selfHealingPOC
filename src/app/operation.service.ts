import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OperationService {

  constructor(private http: HttpClient) { }

  private adfOperationTrigger = 'https://func-self-healing-adf.azurewebsites.net/api/ADF_Trigger_Operation?code=YBQ_7zY1bX_dSowPgBQWr2LCX149ZS__-ATkH-gue4cOAzFuHiU-Cw=='
  private adfOperationPipelineRun = 'https://func-self-healing-adf.azurewebsites.net/api/func-ADF-Operation?code=YBQ_7zY1bX_dSowPgBQWr2LCX149ZS__-ATkH-gue4cOAzFuHiU-Cw=='
  private sqlOperationURL = 'https://func-self-healing-adf.azurewebsites.net/api/SQLOperation?code=YBQ_7zY1bX_dSowPgBQWr2LCX149ZS__-ATkH-gue4cOAzFuHiU-Cw%3D%3D'
  private notificationURL = 'https://prod-18.northcentralus.logic.azure.com:443/workflows/ae12b3b869f3409588289ec02bb877f1/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=G9oJL9u8jsd1TmK6IS7xN49oVvlklFHgco6O2vyj-58'
  operationAction(incidentDetais: any) {
    console.log(incidentDetais);

    if (incidentDetais[0]["RCA_Group"] == 'enhancement') {
      const data = ''
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      const res: Observable<any> = this.http.post(this.sqlOperationURL, data, { headers })
      return res;
    } else if (incidentDetais[0]["RCA_Group"] == 'trigger disabled' || incidentDetais[0]["Description"].includes('self-healed-Trigger')) {
      const data = ''
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      const res: Observable<any> = this.http.post(this.adfOperationTrigger, data, { headers })
      console.log(res);
      return res.pipe(catchError(this.handleError));
    } else if (incidentDetais[0]["RCA_Group"] == 'data load failure' || incidentDetais[0]["Description"].includes('self-healing-poc')) {
      const data = ''
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      const res: Observable<any> = this.http.post(this.adfOperationPipelineRun, data, { headers })
      return res.pipe(catchError(this.handleError));
    } {
      return new Observable(observer => observer.next(0));
    }
  }
  notifyUser(details: any) {
    console.log(details);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    const res: Observable<any> = this.http.post(this.notificationURL, details, { headers })
    return res;
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error occurred.';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}\nDetails: ${error.error}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
