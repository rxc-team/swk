// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

User _$UserFromJson(Map<String, dynamic> json) {
  return User(
    json['user_id'] as String,
    json['user_name'] as String,
    json['email'] as String,
    json['notice_email'] as String,
    json['signature'] as String,
    json['current_app'] as String,
    json['group'] as String,
    json['language'] as String,
    (json['roles'] as List)?.map((e) => e as String)?.toList(),
    (json['apps'] as List)?.map((e) => e as String)?.toList(),
    json['domain'] as String,
    json['customer_id'] as String,
    json['timezone'] as String,
    json['user_type'] as int,
    json['notice_email_status'] as String,
    json['created_at'] as String,
    json['created_by'] as String,
    json['updated_at'] as String,
    json['updated_by'] as String,
    json['deleted_at'] as String,
    json['avatar'] as String,
    json['customer_name'] as String,
  );
}

Map<String, dynamic> _$UserToJson(User instance) => <String, dynamic>{
      'user_id': instance.userId,
      'user_name': instance.userName,
      'email': instance.email,
      'notice_email': instance.noticeEmail,
      'signature': instance.signature,
      'current_app': instance.currentApp,
      'group': instance.group,
      'language': instance.language,
      'roles': instance.roles,
      'apps': instance.apps,
      'domain': instance.domain,
      'customer_id': instance.customerId,
      'timezone': instance.timezone,
      'user_type': instance.userType,
      'notice_email_status': instance.noticeEmailStatus,
      'created_at': instance.createdAt,
      'created_by': instance.createdBy,
      'updated_at': instance.updatedAt,
      'updated_by': instance.updatedBy,
      'deleted_at': instance.deletedAt,
      'avatar': instance.avatar,
      'customer_name': instance.customerName,
    };
