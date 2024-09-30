import { BehaviorSubject, Observable } from 'rxjs';

import { Injectable } from '@angular/core';
import { GenService } from '@api';

@Injectable()
export class StepService {
  constructor(private gs: GenService) {}

  private _current = 0;

  private _sbuject$ = new BehaviorSubject<number>(0);

  init(v) {
    this._current = v || 0;
    this._sbuject$.next(this._current);
  }

  next() {
    console.log(this._current);
    this._current++;
    this._sbuject$.next(this._current);
  }

  pre() {
    this._current--;
    this._sbuject$.next(this._current);
  }

  get change(): Observable<number> {
    return this._sbuject$.asObservable();
  }
}
