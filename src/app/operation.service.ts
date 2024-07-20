import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OperationService {

  constructor(private http: HttpClient) { }

  private adfOperationTrigger = 'https://func-fabric-dev.azurewebsites.net/api/ADF_Trigger_Operation?code=Tr8CGe0fxWYwTMvAkD7Wn4MHXo1ovRAWY85OML19-MDoAzFuf8_lPg%3D%3D'
  private adfOperationPipelineRun = 'https://func-fabric-dev.azurewebsites.net/api/func-ADF-Operation?code=Tr8CGe0fxWYwTMvAkD7Wn4MHXo1ovRAWY85OML19-MDoAzFuf8_lPg%3D%3D'
  private sqlOperationURL = 'https://func-self-healing-adf.azurewebsites.net/api/SQLOperation?code=YBQ_7zY1bX_dSowPgBQWr2LCX149ZS__-ATkH-gue4cOAzFuHiU-Cw%3D%3D'
  private notificationURL = 'https://prod-45.eastus.logic.azure.com:443/workflows/0b7b402a95c44065818182dd48dbf9a6/triggers/When_a_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_a_HTTP_request_is_received%2Frun&sv=1.0&sig=WvIlACltx5gYucjRVO3qGQLOOR2rp_Af02grmxokQqc'
  operationAction(incidentDetais: any) {
    console.log(incidentDetais);

    if (incidentDetais[0]["RCA_Group"] == 'SQL Operation') {
      const data = ''
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      const res: Observable<any> = this.http.post(this.sqlOperationURL, data, { headers })
      return res;
    } else if (incidentDetais[0]["RCA_Group"] == 'ADF Operation' && incidentDetais[0]["Description"].includes('self-healed-Trigger')) {
      const data = ''
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });
      const res: Observable<any> = this.http.post(this.adfOperationTrigger, data, { headers })
      console.log(res);
      return res.pipe(catchError(this.handleError));
    } else if (incidentDetais[0]["RCA_Group"] == 'ADF Operation' && incidentDetais[0]["Description"].includes('self-healing-poc')) {
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
