// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'search_condition.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

SearchCondition _$SearchConditionFromJson(Map<String, dynamic> json) {
  return SearchCondition(
    id: json['id'] as int,
    fieldId: json['field_id'] as String,
    fieldName: json['field_name'] as String,
    fieldType: json['field_type'] as String,
    searchOperator: json['operator'] as String,
    conditionType: json['condition_type'] as String,
    searchValue: json['search_value'] as String,
    isDynamic: json['is_dynamic'] == 0 ? false : true,
  );
}

Map<String, dynamic> _$SearchConditionToJson(SearchCondition instance) =>
    <String, dynamic>{
      'id': instance.id,
      'field_id': instance.fieldId,
      'field_name': instance.fieldName,
      'field_type': instance.fieldType,
      'operator': instance.searchOperator,
      'search_value': instance.searchValue,
      'condition_type': instance.conditionType,
      'is_dynamic': instance.isDynamic,
    };
