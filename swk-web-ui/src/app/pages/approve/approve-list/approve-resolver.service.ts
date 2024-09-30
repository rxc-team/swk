import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { FieldService, WorkflowService } from '@api';

@Injectable({
  providedIn: 'root'
})
export class ApproveResolverService implements Resolve<any> {
  constructor(private fs: FieldService, private wfs: WorkflowService) {}

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const wfId = route.paramMap.get('wf_id');
    let datastore = '';
    let searchFields = [];
    let changeFields = [];
    let updateFields = '';

    await this.wfs.getWorkflowByID(wfId).then(data => {
      if (data) {
        datastore = data.workflow.params['datastore'];
        updateFields = data.workflow.params['fields'];
      } else {
        datastore = '';
      }
    });

    if (!updateFields) {
      await this.fs.getFields(datastore).then(data => {
        if (data) {
          searchFields = data.filter(f => !f.as_title);

          searchFields.forEach(f => {
            changeFields.push(f);
          });
        } else {
          searchFields = [];
          changeFields = [];
        }
      });
    } else {
      const updateFieldList = updateFields.split(',');

      await this.fs.getFields(datastore).then(data => {
        if (data) {
          searchFields = data.filter(f => !f.as_title);

          updateFieldList.forEach(f => {
            const field = searchFields.find(sf => sf.field_id === f);
            if (field) {
              changeFields.push(field);
            }
          });
        } else {
          searchFields = [];
          changeFields = [];
        }
      });
    }

    return { datastore, searchFields, changeFields };
  }
}
