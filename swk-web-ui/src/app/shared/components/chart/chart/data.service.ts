import { Injectable } from '@angular/core';
import { DashboardService } from '@api';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private dashService: DashboardService) {}

  async search(dashboard: string) {
    let data: {
      dashboard_datas?: DashboardData[];
      dashboard_name?: string;
      dashboard_type?: string;
    } = {};

    await this.dashService.getDashboardData(dashboard).then((dsData: any) => {
      if (dsData) {
        data = dsData;
      }
    });

    return data.dashboard_datas;
  }

  /**
   * 生成随机的 UUID
   */
  genUUID(randomLength) {
    return Number(Math.random().toString().substr(3, randomLength) + Date.now()).toString(36);
  }
}

export interface DashboardData {
  x_value?: string;
  x_type?: string;
  x_name?: string;
  g_value?: string;
  g_type?: string;
  y_value?: number;
  y_name?: string;
}
