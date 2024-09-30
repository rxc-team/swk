// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'lang.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Lang _$LangFromJson(Map<String, dynamic> json) {
  return Lang(
    (json['apps'] as Map<String, dynamic>)?.map(
      (k, e) => MapEntry(
          k, e == null ? null : App.fromJson(e as Map<String, dynamic>)),
    ),
    json['common'] == null
        ? null
        : Common.fromJson(json['common'] as Map<String, dynamic>),
  );
}

Map<String, dynamic> _$LangToJson(Lang instance) => <String, dynamic>{
      'apps': instance.apps,
      'common': instance.common,
    };

App _$AppFromJson(Map<String, dynamic> json) {
  return App(
    json['app_name'] as String,
    (json['datastores'] as Map<String, dynamic>)?.map(
      (k, e) => MapEntry(k, e as String),
    ),
    (json['fields'] as Map<String, dynamic>)?.map(
      (k, e) => MapEntry(k, e as String),
    ),
    (json['options'] as Map<String, dynamic>)?.map(
      (k, e) => MapEntry(k, e as String),
    ),
  );
}

Map<String, dynamic> _$AppToJson(App instance) => <String, dynamic>{
      'app_name': instance.appName,
      'datastores': instance.datastores,
      'fields': instance.fields,
      'options': instance.options,
    };

Common _$CommonFromJson(Map<String, dynamic> json) {
  return Common(
    (json['workflows'] as Map<String, dynamic>)?.map(
      (k, e) => MapEntry(k, e as String),
    ),
    (json['assignes'] as Map<String, dynamic>)?.map(
      (k, e) => MapEntry(k, e as String),
    ),
  );
}

Map<String, dynamic> _$CommonToJson(Common instance) => <String, dynamic>{
      'workflows': instance.workflows,
      'assignes': instance.assignes,
    };
