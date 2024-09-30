/*
 * @Description: 文件工具类
 * @Author: RXC 呉見華
 * @Date: 2019-04-22 10:19:55
 * @LastEditors: RXC 呉見華
 * @LastEditTime: 2020-02-28 13:23:51
 */
import * as Encoding from 'encoding-japanese';

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FileUtilService {
  private supportFileTypes = {
    image: [
      {
        mimeType: 'image/png',
        extensionName: 'png'
      },
      {
        mimeType: 'image/jpeg',
        extensionName: 'jpg/jpeg/jpg'
      }
    ],
    csv: [
      {
        mimeType: 'text/csv',
        extensionName: 'csv'
      },
      {
        mimeType: 'application/vnd.ms-excel',
        extensionName: 'csv'
      },
      {
        mimeType: 'text/plain',
        extensionName: 'txt'
      }
    ],
    zip: [
      {
        mimeType: 'application/zip',
        extensionName: 'zip'
      },
      {
        mimeType: 'application/x-zip-compressed',
        extensionName: 'zip'
      }
    ],
    office: [
      {
        mimeType: 'application/msword',
        extensionName: 'doc'
      },
      {
        mimeType: 'application/vnd.ms-word.document.macroEnabled.12',
        extensionName: 'docm'
      },
      {
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        extensionName: 'docx'
      },
      {
        mimeType: 'application/vnd.ms-excel',
        extensionName: 'xls'
      },
      {
        mimeType: 'application/vnd.ms-excel.sheet.macroEnabled.12',
        extensionName: 'xlsm'
      },
      {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extensionName: 'xlsx'
      },
      {
        mimeType: 'application/vnd.ms-powerpoint',
        extensionName: 'ppt'
      },
      {
        mimeType: 'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
        extensionName: 'pptm'
      },
      {
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        extensionName: 'pptx'
      },
      {
        mimeType: 'application/pdf',
        extensionName: 'pdf'
      }
    ]
  };

  constructor() {}

  /**
   * @description: 获取支持的文件后缀名列表
   * @return: 获取支持的文件后缀名列表
   */
  getSupportTypes(isPic: boolean) {
    const suffixList = new Set();
    if (isPic) {
      this.supportFileTypes.image.forEach(f => {
        suffixList.add(`.${f.extensionName}`);
      });

      return Array.from(suffixList);
    }

    // tslint:disable-next-line: forin
    for (const key in this.supportFileTypes) {
      const fileType = this.supportFileTypes[key];
      fileType.forEach(f => {
        suffixList.add(`.${f.extensionName}`);
      });
    }

    return Array.from(suffixList);
  }

  async getEncoding(file): Promise<string> {
    let coding = '';
    await this.reader(file).then((e: any) => {
      const cd = Encoding.detect(e.target.result);
      switch (cd) {
        case 'SJIS':
          coding = 'Shift-JIS';
          break;
        case 'UTF8':
          coding = 'UTF-8';
          break;
        default:
          break;
      }
    });
    return coding;
  }

  checkSupport(mimeType: string, isPic: boolean): boolean {
    if (isPic) {
      const find = this.supportFileTypes.image.find(f => f.mimeType === mimeType);
      if (find) {
        return true;
      }
      return false;
    }
    // tslint:disable-next-line: forin
    for (const key in this.supportFileTypes) {
      const fileType = this.supportFileTypes[key];
      const find = fileType.find(f => f.mimeType === mimeType);
      if (find) {
        return true;
      }
    }
    return false;
  }

  checkSize(size: number) {
    const isLt5M = size / 1024 / 1024 < 5;
    if (isLt5M) {
      return true;
    }
    return false;
  }

  async checkEncoding(file, encoding?: string): Promise<boolean> {
    let result = false;
    await this.reader(file).then((e: any) => {
      const cd = Encoding.detect(e.target.result);
      switch (cd) {
        case 'SJIS':
          if (encoding === 'Shift-JIS') {
            result = true;
            break;
          }
          result = false;
          break;
        case 'UTF8':
          if (encoding === 'UTF-8') {
            result = true;
            break;
          }
          result = false;
          break;
        default:
          result = false;
          break;
      }
    });
    return Promise.resolve(result);
  }

  private reader(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function (e) {
        resolve(e);
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  }
}
