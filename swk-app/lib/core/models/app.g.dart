// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

AppData _$AppDataFromJson(Map<String, dynamic> json) {
  return AppData(
    json['app_id'] as String,
    json['app_name'] as String,
    json['display_order'] as int,
    json['domain'] as String,
    json['created_at'] as String,
    json['created_by'] as String,
    json['updated_at'] as String,
    json['updated_by'] as String,
    json['deleted_at'] as String,
    json['start_time'] as String,
    json['end_time'] as String,
  );
}

Map<String, dynamic> _$AppDataToJson(AppData instance) => <String, dynamic>{
      'app_id': instance.appId,
      'app_name': instance.appName,
      'display_order': instance.displayOrder,
      'domain': instance.domain,
      'created_at': instance.createdAt,
      'created_by': instance.createdBy,
      'updated_at': instance.updatedAt,
      'updated_by': instance.updatedBy,
      'deleted_at': instance.deletedAt,
      'start_time': instance.startTime,
      'end_time': instance.endTime,
    };
