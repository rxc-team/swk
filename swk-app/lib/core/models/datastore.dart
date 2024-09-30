import 'package:json_annotation/json_annotation.dart';

part 'datastore.g.dart';

List<Datastore> getDatastoreList(List<dynamic> list) {
  List<Datastore> result = [];
  list.forEach((item) {
    result.add(Datastore.fromJson(item));
  });
  return result;
}

@JsonSerializable()
class Datastore extends Object {
  @JsonKey(name: 'datastore_id')
  String datastoreId;

  @JsonKey(name: 'app_id')
  String appId;

  @JsonKey(name: 'datastore_name')
  String datastoreName;

  @JsonKey(name: 'api_key')
  String apiKey;

  @JsonKey(name: 'can_check')
  bool canCheck;

  @JsonKey(name: 'show_in_menu')
  bool showInMenu;

  @JsonKey(name: 'no_status')
  bool noStatus;

  @JsonKey(name: 'encoding')
  String encoding;

  @JsonKey(name: 'sorts')
  List<Sorts> sorts;

  @JsonKey(name: 'scan_fields')
  List<String> scanFields;

  @JsonKey(name: 'scan_fields_connector')
  String scanFieldsConnector;

  @JsonKey(name: 'print_field1')
  String printField1;

  @JsonKey(name: 'print_field2')
  String printField2;

  @JsonKey(name: 'print_field3')
  String printField3;

  @JsonKey(name: 'unique_fields')
  List<String> uniqueFields;

  @JsonKey(name: 'relations')
  List<Relations> relations;

  @JsonKey(name: 'created_at')
  String createdAt;

  @JsonKey(name: 'created_by')
  String createdBy;

  @JsonKey(name: 'updated_at')
  String updatedAt;

  @JsonKey(name: 'updated_by')
  String updatedBy;

  @JsonKey(name: 'deleted_at')
  String deletedAt;

  @JsonKey(name: 'deleted_by')
  String deletedBy;

  Datastore(
    this.datastoreId,
    this.appId,
    this.datastoreName,
    this.apiKey,
    this.canCheck,
    this.showInMenu,
    this.noStatus,
    this.encoding,
    this.sorts,
    this.scanFields,
    this.scanFieldsConnector,
    this.printField1,
    this.printField2,
    this.printField3,
    this.uniqueFields,
    this.relations,
    this.createdAt,
    this.createdBy,
    this.updatedAt,
    this.updatedBy,
    this.deletedAt,
    this.deletedBy,
  );

  factory Datastore.fromJson(Map<String, dynamic> srcJson) => _$DatastoreFromJson(srcJson);

  Map<String, dynamic> toJson() => _$DatastoreToJson(this);
}

@JsonSerializable()
class Sorts extends Object {
  @JsonKey(name: 'sort_key')
  String sortKey;

  @JsonKey(name: 'sort_value')
  String sortValue;

  Sorts(
    this.sortKey,
    this.sortValue,
  );

  factory Sorts.fromJson(Map<String, dynamic> srcJson) => _$SortsFromJson(srcJson);

  Map<String, dynamic> toJson() => _$SortsToJson(this);
}

@JsonSerializable()
class Relations extends Object {
  @JsonKey(name: 'relation_id')
  String relationId;

  @JsonKey(name: 'datastore_id')
  String datastoreId;

  @JsonKey(name: 'fields')
  Map<String, String> fields;

  Relations(
    this.relationId,
    this.datastoreId,
    this.fields,
  );

  factory Relations.fromJson(Map<String, dynamic> srcJson) => _$RelationsFromJson(srcJson);

  Map<String, dynamic> toJson() => _$RelationsToJson(this);
}
