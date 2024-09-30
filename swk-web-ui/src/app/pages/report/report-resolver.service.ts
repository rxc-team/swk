import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ReportService } from '@api';

@Injectable({
  providedIn: 'root'
})
export class ReportResolverService implements Resolve<string> {
  constructor(private rs: ReportService) {}

  async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<string> {
    let name = '';
    await this.rs.getReportByID(route.paramMap.get('r_id')).then((data: any) => {
      if (data) {
        name = data.report_name;
      }
    });
    return name;
  }
}
