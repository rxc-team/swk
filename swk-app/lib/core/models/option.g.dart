// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'option.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Option _$OptionFromJson(Map<String, dynamic> json) {
  return Option(
    json['option_value'] as String,
    json['option_label'] as String,
    optionId: json['option_id'] as String,
    optionName: json['option_name'] as String,
    optionMemo: json['option_memo'] as String,
    appId: json['app_id'] as String,
    createdAt: json['created_at'] as String,
    createdBy: json['created_by'] as String,
    updatedAt: json['updated_at'] as String,
    updatedBy: json['updated_by'] as String,
    deletedAt: json['deleted_at'] as String,
  );
}

Map<String, dynamic> _$OptionToJson(Option instance) => <String, dynamic>{
      'option_id': instance.optionId,
      'option_value': instance.optionValue,
      'option_label': instance.optionLabel,
      'option_name': instance.optionName,
      'option_memo': instance.optionMemo,
      'app_id': instance.appId,
      'created_at': instance.createdAt,
      'created_by': instance.createdBy,
      'updated_at': instance.updatedAt,
      'updated_by': instance.updatedBy,
      'deleted_at': instance.deletedAt,
    };
