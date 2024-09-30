import { BehaviorSubject } from 'rxjs';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpSpinService {
  public numberOfRequests = 0;
  public showSpinner: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  handleRequest = (state: string = 'minus'): void => {
    this.numberOfRequests = state === 'plus' ? this.numberOfRequests + 1 : this.numberOfRequests - 1;
    this.showSpinner.next(this.numberOfRequests > 0);
  };

  reset = (): void => {
    this.numberOfRequests = 0;
    this.showSpinner.next(this.numberOfRequests > 0);
  };
}
