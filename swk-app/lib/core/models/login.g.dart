// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'login.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Login _$LoginFromJson(Map<String, dynamic> json) {
  return Login(
    json['access_token'] as String,
    json['is_valid_app'] as bool,
    json['refresh_token'] as String,
    json['user'] == null
        ? null
        : User.fromJson(json['user'] as Map<String, dynamic>),
    json['user_flg'] as int,
  );
}

Map<String, dynamic> _$LoginToJson(Login instance) => <String, dynamic>{
      'access_token': instance.accessToken,
      'is_valid_app': instance.isValidApp,
      'refresh_token': instance.refreshToken,
      'user': instance.user,
      'user_flg': instance.userFlg,
    };
