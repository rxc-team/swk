// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'display_field.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

DisplayField _$DisplayFieldFromJson(Map<String, dynamic> json) {
  return DisplayField(
    id: json['id'] as int,
    datastoreId: json['datastore_id'] as String,
    fieldId: json['field_id'] as String,
    fieldName: json['field_name'] as String,
    fieldType: json['field_type'] as String,
    displayOrder: json['display_order'] as int,
  );
}

Map<String, dynamic> _$DisplayFieldToJson(DisplayField instance) => <String, dynamic>{
      'id': instance.id,
      'datastore_id': instance.datastoreId,
      'field_id': instance.fieldId,
      'field_name': instance.fieldName,
      'field_type': instance.fieldType,
      'display_order': instance.displayOrder,
    };
