// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'items.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Items _$ItemsFromJson(Map<String, dynamic> json) {
  return Items(
    (json['items_list'] as List)?.map((e) => e == null ? null : Item.fromJson(e as Map<String, dynamic>))?.toList(),
    json['total'] as int,
  );
}

Map<String, dynamic> _$ItemsToJson(Items instance) => <String, dynamic>{
      'items_list': instance.itemsList,
      'total': instance.total,
    };

Item _$ItemFromJson(Map<String, dynamic> json) {
  return Item(
    json['app_id'] as String,
    json['check_type'] as String,
    json['checked_at'] as String,
    json['checked_by'] as String,
    json['created_at'] as String,
    json['created_by'] as String,
    json['datastore_id'] as String,
    json['item_id'] as String,
    (json['items'] as Map<String, dynamic>)?.map(
      (k, e) => MapEntry(k, e == null ? null : Value.fromJson(e as Map<String, dynamic>)),
    ),
    json['label_time'] as String,
    (json['owners'] as List)?.map((e) => e as String)?.toList(),
    json['check_status'] as String,
    json['status'] as String,
    json['updated_at'] as String,
    json['updated_by'] as String,
  );
}

Map<String, dynamic> _$ItemToJson(Item instance) => <String, dynamic>{
      'app_id': instance.appId,
      'check_type': instance.checkType,
      'checked_at': instance.checkedAt,
      'checked_by': instance.checkedBy,
      'created_at': instance.createdAt,
      'created_by': instance.createdBy,
      'datastore_id': instance.datastoreId,
      'item_id': instance.itemId,
      'items': instance.items,
      'label_time': instance.labelTime,
      'owners': instance.owners,
      'check_status': instance.checkStatus,
      'status': instance.status,
      'updated_at': instance.updatedAt,
      'updated_by': instance.updatedBy,
    };

Value _$ValueFromJson(Map<String, dynamic> json) {
  return Value(
    json['value'],
    json['data_type'] as String,
  );
}

Map<String, dynamic> _$ValueToJson(Value instance) => <String, dynamic>{
      'value': instance.value,
      'data_type': instance.dataType,
    };
