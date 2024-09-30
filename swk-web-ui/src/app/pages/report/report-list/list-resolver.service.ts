import { forkJoin } from 'rxjs';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { UserService } from '@api';
import { SelectItem } from '@core';

@Injectable({
  providedIn: 'root'
})
export class ListResolverService implements Resolve<any> {
  constructor(private userService: UserService) {}

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {
    let users = [];

    const jobs = [this.userService.getUsers({ invalid: 'true' })];

    await forkJoin(jobs)
      .toPromise()
      .then((data: any[]) => {
        const usersData = data[0];

        if (usersData) {
          const userList: Array<SelectItem> = [];
          usersData.forEach(user => {
            userList.push({ label: user.user_name, value: user.user_id });
          });
          users = userList;
        } else {
          users = [];
        }
      });

    return { users };
  }
}
