import { NgEventBus } from 'ng-event-bus';
import { Observable, Subject } from 'rxjs';

import { Injectable } from '@angular/core';
import { UserService } from '@api';

const TOKEN_KEY = 'access_token';
const REFRESHTOKEN_KEY = 'refresh_token';
const USER_KEY = 'web_user';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private userInfo: Subject<any> = new Subject<any>();

  constructor(private eventBus: NgEventBus, private userService: UserService) {}

  signOut(err?: any): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESHTOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.eventBus.cast('logout', err);
  }

  public saveToken(token: string): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem(TOKEN_KEY, token);
    const user = this.getUser();
    if (user.id) {
      this.saveUser(Object.assign(user, { access_token: token }));
    }
  }

  public isLogin(): boolean {
    return localStorage.getItem(TOKEN_KEY) !== null;
  }

  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public saveRefreshToken(token: string): void {
    localStorage.removeItem(REFRESHTOKEN_KEY);
    localStorage.setItem(REFRESHTOKEN_KEY, token);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(REFRESHTOKEN_KEY);
  }

  public saveUser(user: any): void {
    localStorage.removeItem(USER_KEY);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userInfo.next(user);
  }

  public async updateUser(payload: any): Promise<void> {
    const user = this.getUser();
    if (user.id) {
      await this.userService.updateUser(payload, user.id, { realUpdate: 'true' });
      this.saveUser(Object.assign(user, payload));
    }
  }

  public getUserInfo(): Observable<any> {
    return this.userInfo.asObservable();
  }

  public getUser(): any {
    const user = localStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return {};
  }

  public getUserApp() {
    const user = this.getUser();
    if (user) {
      return user.current_app;
    }
    return '';
  }

  public getUserLang() {
    const user = this.getUser();
    if (user) {
      return user.language;
    }
    return '';
  }
  public getUserTimeZone() {
    const user = this.getUser();
    if (user) {
      return user.timezone;
    }
    return '';
  }

  public getUserId() {
    const user = this.getUser();
    if (user) {
      return user.id;
    }
    return '';
  }
}
