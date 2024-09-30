// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'datastore.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Datastore _$DatastoreFromJson(Map<String, dynamic> json) {
  List<Sorts> sorts = [];
  if (json["sorts"] != null) {
    sorts = (json['sorts'] as List<dynamic>).map((e) => Sorts.fromJson(e as Map<String, dynamic>)).toList();
  }
  List<String> scanFields = [];
  if (json["scan_fields"] != null) {
    scanFields = (json['scan_fields'] as List<dynamic>).map((e) => e as String).toList();
  }
  List<String> uniqueFields = [];
  if (json["unique_fields"] != null) {
    uniqueFields = (json['unique_fields'] as List<dynamic>).map((e) => e as String).toList();
  }
  List<Relations> relations = [];
  if (json["relations"] != null) {
    relations = (json['relations'] as List<dynamic>).map((e) => Relations.fromJson(e as Map<String, dynamic>)).toList();
  }

  return Datastore(
    json['datastore_id'] as String,
    json['app_id'] as String,
    json['datastore_name'] as String,
    json['api_key'] as String,
    json['can_check'] as bool,
    json['show_in_menu'] as bool,
    json['no_status'] as bool,
    json['encoding'] as String,
    sorts,
    scanFields,
    json['scan_fields_connector'] as String,
    json['print_field1'] as String,
    json['print_field2'] as String,
    json['print_field3'] as String,
    uniqueFields,
    relations,
    json['created_at'] as String,
    json['created_by'] as String,
    json['updated_at'] as String,
    json['updated_by'] as String,
    json['deleted_at'] as String,
    json['deleted_by'] as String,
  );
}

Map<String, dynamic> _$DatastoreToJson(Datastore instance) => <String, dynamic>{
      'datastore_id': instance.datastoreId,
      'app_id': instance.appId,
      'datastore_name': instance.datastoreName,
      'api_key': instance.apiKey,
      'can_check': instance.canCheck,
      'show_in_menu': instance.showInMenu,
      'no_status': instance.noStatus,
      'encoding': instance.encoding,
      'sorts': instance.sorts,
      'scan_fields': instance.scanFields,
      'scan_fields_connector': instance.scanFieldsConnector,
      'print_field1': instance.printField1,
      'print_field2': instance.printField2,
      'print_field3': instance.printField3,
      'unique_fields': instance.uniqueFields,
      'relations': instance.relations,
      'created_at': instance.createdAt,
      'created_by': instance.createdBy,
      'updated_at': instance.updatedAt,
      'updated_by': instance.updatedBy,
      'deleted_at': instance.deletedAt,
      'deleted_by': instance.deletedBy,
    };

Sorts _$SortsFromJson(Map<String, dynamic> json) => Sorts(
      json['sort_key'] as String,
      json['sort_value'] as String,
    );

Map<String, dynamic> _$SortsToJson(Sorts instance) => <String, dynamic>{
      'sort_key': instance.sortKey,
      'sort_value': instance.sortValue,
    };

Relations _$RelationsFromJson(Map<String, dynamic> json) => Relations(
      json['relation_id'] as String,
      json['datastore_id'] as String,
      Map<String, String>.from(json['fields'] as Map),
    );

Map<String, dynamic> _$RelationsToJson(Relations instance) => <String, dynamic>{
      'relation_id': instance.relationId,
      'datastore_id': instance.datastoreId,
      'fields': instance.fields,
    };
