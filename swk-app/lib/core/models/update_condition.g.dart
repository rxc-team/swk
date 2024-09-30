// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'update_condition.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

UpdateCondition _$UpdateConditionFromJson(Map<String, dynamic> json) {
  return UpdateCondition(
    id: json['id'] as int,
    datastoreId: json['datastore_id'] as String,
    fieldId: json['field_id'] as String,
    fieldName: json['field_name'] as String,
    fieldType: json['field_type'] as String,
    lookupDatastoreId: json['lookup_datastore_id'] as String,
    lookupFieldId: json['lookup_field_id'] as String,
    optionId: json['option_id'] as String,
    updateValue: json['update_value'] as String,
  );
}

Map<String, dynamic> _$UpdateConditionToJson(UpdateCondition instance) =>
    <String, dynamic>{
      'id': instance.id,
      'datastore_id': instance.datastoreId,
      'field_id': instance.fieldId,
      'field_name': instance.fieldName,
      'field_type': instance.fieldType,
      'lookup_datastore_id': instance.lookupDatastoreId,
      'lookup_field_id': instance.lookupFieldId,
      'option_id': instance.optionId,
      'update_value': instance.updateValue,
    };
