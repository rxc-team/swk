import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mt'
})
export class MtPipe implements PipeTransform {
  transform(value: string): string {
    if (value === 'insert') {
      return 'page.datastore.mapping.mappingTypeInsert';
    }
    if (value === 'upsert') {
      return 'page.datastore.mapping.mappingTypeUpsert';
    }
    if (value === 'update') {
      return 'page.datastore.mapping.mappingTypeUpdate';
    }

    return null;
  }
}
