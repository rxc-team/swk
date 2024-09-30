import { forkJoin } from 'rxjs';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { DatastoreService, FieldService, OptionService, UserService } from '@api';

@Injectable({
  providedIn: 'root'
})
export class ListResolverService implements Resolve<any> {
  constructor(private field: FieldService, private ds: DatastoreService) { }

  /* async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log(route.data);

    const datastoreId = route.paramMap.get('d_id');
    let apiKey = '';
    let fields = [];
    let qrFields = [];
    let qrConnector = '';
    let canCheck = false;

    const jobs = [this.field.getFields(datastoreId), this.ds.getDatastoreByID(datastoreId)];

    await forkJoin(jobs)
      .toPromise()
      .then(async (data: any[]) => {
        if (data) {
          const fieldsData = data[0];
          const dsData = data[1];

          if (fieldsData) {
            fields = fieldsData.filter(f => !f.as_title);
          } else {
            fields = [];
          }
          if (dsData) {
            apiKey = dsData.api_key;
            qrFields = dsData.scan_fields || [];
            qrConnector = dsData.scan_fields_connector;
            canCheck = dsData.can_check;
          } else {
            apiKey = '';
          }
        }
      });

    return { fields, qrFields, qrConnector, apiKey, canCheck };
  } */

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log(route.data);

    const datastoreId = route.paramMap.get('d_id');
    let fields = [];

    await this.field.getFields(datastoreId).then((data: any) => {
      if (data) {
        fields = data.filter(f => !f.as_title);
      } else {
        fields = [];
      }
    });

    return { fields };
  }
}
