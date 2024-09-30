// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'field.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Field _$FieldFromJson(Map<String, dynamic> json) {
  double minValue = 0;
  double maxValue = 0;
  if (json['min_value'] is int) {
    minValue = double.parse(json['min_value'].toString());
  } else {
    minValue = json['min_value'] as double;
  }
  if (json['max_value'] is int) {
    maxValue = double.parse(json['max_value'].toString());
  } else {
    maxValue = json['max_value'] as double;
  }

  return Field(
    json['field_id'] as String,
    json['field_name'] as String,
    json['field_type'] as String,
    appId: json['app_id'] as String,
    datastoreId: json['datastore_id'] as String,
    isRequired: json['is_required'] as bool,
    asTitle: json['as_title'] as bool,
    isImage: json['is_image'] as bool,
    isCheckImage: json['is_check_image'] as bool,
    optionId: json['option_id'] as String,
    userGroupId: json['user_group_id'] as String,
    lookupDatastoreId: json['lookup_datastore_id'] as String,
    lookupFieldId: json['lookup_field_id'] as String,
    minLength: json['min_length'] as int,
    maxLength: json['max_length'] as int,
    minValue: minValue,
    maxValue: maxValue,
    displayDigits: json['display_digits'] as int,
    prefix: json['prefix'] as String,
    precision: json['precision'] as int,
    displayOrder: json['display_order'] as int,
    returnType: json['return_type'] as String,
    createdAt: json['created_at'] as String,
    createdBy: json['created_by'] as String,
    updatedAt: json['updated_at'] as String,
    updatedBy: json['updated_by'] as String,
    isDynamic: true,
  );
}

Map<String, dynamic> _$FieldToJson(Field instance) => <String, dynamic>{
      'field_id': instance.fieldId,
      'app_id': instance.appId,
      'datastore_id': instance.datastoreId,
      'field_name': instance.fieldName,
      'field_type': instance.fieldType,
      'is_required': instance.isRequired,
      'as_title': instance.asTitle,
      'is_image': instance.isImage,
      'is_check_image': instance.isCheckImage,
      'option_id': instance.optionId,
      'user_group_id': instance.userGroupId,
      'lookup_datastore_id': instance.lookupDatastoreId,
      'lookup_field_id': instance.lookupFieldId,
      'min_length': instance.minLength,
      'max_length': instance.maxLength,
      'min_value': instance.minValue,
      'max_value': instance.maxValue,
      'prefix': instance.prefix,
      'precision': instance.precision,
      'display_digits': instance.displayDigits,
      'display_order': instance.displayOrder,
      'return_type': instance.returnType,
      'created_at': instance.createdAt,
      'created_by': instance.createdBy,
      'updated_at': instance.updatedAt,
      'updated_by': instance.updatedBy,
      'is_dynamic': instance.isDynamic,
    };
