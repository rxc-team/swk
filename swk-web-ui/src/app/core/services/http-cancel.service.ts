import { Observable, Subject } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class HttpCancelService {
  private pendingHTTPRequests$ = new Subject<void>();
  private refresh$ = new Subject<boolean>();

  constructor() {}

  // Cancel Pending HTTP calls
  public cancelPendingRequests() {
    this.pendingHTTPRequests$.next();
  }

  public onCancelPendingRequests(): Observable<void> {
    return this.pendingHTTPRequests$.asObservable();
  }
}
