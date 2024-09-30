import { forkJoin } from 'rxjs';

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { DatastoreService, FieldService, OptionService, UserService } from '@api';
import { SelectItem } from '@core';

@Injectable({
  providedIn: 'root'
})
export class QueryResolverService implements Resolve<any> {
  constructor(private field: FieldService, private user: UserService, private option: OptionService, private ds: DatastoreService) {}

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const datastoreId = route.paramMap.get('d_id');
    let apiKey = '';
    let fields = [];
    let qrFields = [];
    let qrConnector = '';
    let canCheck = false;

    let users = [];
    const options: Map<string, Array<SelectItem>> = new Map();

    const jobs = [this.field.getFields(datastoreId), this.user.getUsers({ invalid: 'true' }), this.ds.getDatastoreByID(datastoreId)];

    await forkJoin(jobs)
      .toPromise()
      .then(async (data: any[]) => {
        if (data) {
          const fieldsData = data[0];
          const usersData = data[1];
          const dsData = data[2];

          if (fieldsData) {
            fields = fieldsData.filter(f => !f.as_title);

            const optFields = fields.filter(f => f.field_type === 'options');
            if (optFields && optFields.length > 0) {
              const ojobs = optFields.map(f => this.option.getOptionsByCode(f.option_id, 'true'));
              await forkJoin(ojobs)
                .toPromise()
                .then((opts: any[]) => {
                  if (opts) {
                    optFields.forEach((f, index) => {
                      const optionList: Array<SelectItem> = [];
                      const optionsData = opts[index];
                      optionsData.forEach(option => {
                        optionList.push({ label: option.option_label, value: option.option_value });
                      });

                      options.set(f.field_id, optionList);
                    });
                  }
                });
            }
          } else {
            fields = [];
          }
          if (usersData) {
            const userList: Array<SelectItem> = [];
            usersData.forEach(user => {
              userList.push({ label: user.user_name, value: user.user_id });
            });
            users = userList;
          } else {
            users = [];
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

    return { fields, qrFields, qrConnector, users, options, apiKey, canCheck };
  }
}
