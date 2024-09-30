import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { DatastoreService } from '@api';

@Injectable({
  providedIn: 'root'
})
export class DatabaseResolverService implements Resolve<string> {
  constructor(private ds: DatastoreService) { }

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<string> {
    let name = '';
    let apiKey = '';
    let canCheck = false;
    await this.ds.getDatastoreByID(route.paramMap.get('d_id')).then((data: any) => {
      if (data) {
        name = data.datastore_name;
        apiKey = data.api_key;
        canCheck = data.can_check;
      } else {
        apiKey = '';
      }
      if (canCheck) {
        localStorage.removeItem("canCheck");
        localStorage.setItem("canCheck", 'true');
      } else {
        localStorage.removeItem("canCheck");
        localStorage.setItem("canCheck", 'false');
      }
      localStorage.removeItem("apiKey");
      localStorage.setItem("apiKey", apiKey);

    });
    return name;
  }
}
