import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { ReportService } from '@api';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private report: ReportService) { }

  async search(reportId: string, xField: string, yField: string, gField: string) {
    let reportInfo: {
      item_data?: any[];
      fields?: any;
    } = {};

    await this.report
      .getReportData(reportId, {
        condition_type: 'and'
      })
      .then((rpData: any) => {
        if (rpData) {
          reportInfo = rpData;
        } else {
          reportInfo = {
            item_data: [],
            fields: {}
          };
        }
      });

    const result = [];

    reportInfo.item_data.forEach(reportdata => {
      const item: DashboardData = {};

      switch (xField) {
        case 'check_type':
          item.x_value = reportdata.check_type;
          item.x_name = reportInfo.fields[xField].alias_name;
          break;
        case 'check_status':
          item.x_value = reportdata.check_status;
          item.x_name = reportInfo.fields[xField].alias_name;
          break;
        case 'created_at':
          item.x_value = reportdata.created_at;
          item.x_name = reportInfo.fields[xField].alias_name;
          break;
        case 'created_by':
          item.x_value = reportdata.created_by;
          item.x_name = reportInfo.fields[xField].alias_name;
          break;
        case 'updated_at':
          item.x_value = reportdata.updated_at;
          item.x_name = reportInfo.fields[xField].alias_name;
          break;
        case 'updated_by':
          item.x_value = reportdata.updated_by;
          item.x_name = reportInfo.fields[xField].alias_name;
          break;
        case 'checked_at':
          item.x_value = reportdata.checked_at;
          item.x_name = reportInfo.fields[xField].alias_name;
          break;
        case 'checked_by':
          item.x_value = reportdata.checked_by;
          item.x_name = reportInfo.fields[xField].alias_name;
          break;

        default:
          const xvalue = reportdata.items[xField].value;
          if (xvalue) {
            item.x_value = xvalue;
          } else {
            item.x_value = '-';
          }
          item.x_type = reportInfo.fields[xField].data_type;
          item.x_name = reportInfo.fields[xField].alias_name;
          break;
      }

      if (yField === 'count') {
        item.y_value = Number(reportdata.count);
        item.y_name = reportInfo.fields[yField].alias_name;
      } else {
        item.y_name = reportInfo.fields[yField].alias_name;
        const yvalue = reportdata.items[yField].value;
        if (yvalue) {
          item.y_value = Number(yvalue);
        } else {
          item.y_value = 0;
        }
      }

      if (gField) {
        switch (gField) {
          case 'check_type':
            item.g_value = reportdata.check_type;
            break;
          case 'check_status':
            item.g_value = reportdata.check_status;
            break;
          case 'created_at':
            item.g_value = reportdata.created_at;
            break;
          case 'created_by':
            item.g_value = reportdata.created_by;
            break;
          case 'updated_at':
            item.g_value = reportdata.updated_at;
            break;
          case 'updated_by':
            item.g_value = reportdata.updated_by;
            break;
          case 'checked_at':
            item.g_value = reportdata.checked_at;
            break;
          case 'checked_by':
            item.g_value = reportdata.checked_by;
            break;

          default:
            const gvalue = reportdata.items[gField].value;
            item.g_type = reportInfo.fields[gField].data_type;
            if (gvalue) {
              item.g_value = gvalue;
            } else {
              item.g_value = '-';
            }
            break;
        }
      }

      result.push(item);
    });

    return _.sortBy(result, 'x_value');
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
