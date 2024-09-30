import { Injectable } from '@angular/core';
import { RoleService } from '@api';

@Injectable({
  providedIn: 'root'
})
export class AclService {
  constructor(private rs: RoleService) {}

  async init() {
    await this.rs.getUserAction().then(data => {
      if (data) {
        sessionStorage.setItem('actions', JSON.stringify(data));
      }
    });
  }

  checkAction(objectId: string, act: string) {
    const data = sessionStorage.getItem('actions');
    const actions: any[] = JSON.parse(data);

    const index = actions.findIndex(a => a.object_id === objectId && a.action_map[act] === true);
    return index >= 0;
  }
}
