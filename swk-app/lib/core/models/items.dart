import 'package:json_annotation/json_annotation.dart';

part 'items.g.dart';

@JsonSerializable()
class Items extends Object {
  @JsonKey(name: 'items_list')
  List<Item> itemsList;

  @JsonKey(name: 'total')
  int total;

  Items(
    this.itemsList,
    this.total,
  );

  factory Items.fromJson(Map<String, dynamic> srcJson) => _$ItemsFromJson(srcJson);

  Map<String, dynamic> toJson() => _$ItemsToJson(this);
}

@JsonSerializable()
class Item extends Object {
  @JsonKey(name: 'app_id')
  String appId;

  @JsonKey(name: 'check_type')
  String checkType;

  @JsonKey(name: 'checked_at')
  String checkedAt;

  @JsonKey(name: 'checked_by')
  String checkedBy;

  @JsonKey(name: 'created_at')
  String createdAt;

  @JsonKey(name: 'created_by')
  String createdBy;

  @JsonKey(name: 'datastore_id')
  String datastoreId;

  @JsonKey(name: 'item_id')
  String itemId;

  @JsonKey(name: 'items')
  Map<String, Value> items;

  @JsonKey(name: 'label_time')
  String labelTime;

  @JsonKey(name: 'owners')
  List<String> owners;

  @JsonKey(name: 'check_status')
  String checkStatus;

  @JsonKey(name: 'status')
  String status;

  @JsonKey(name: 'updated_at')
  String updatedAt;

  @JsonKey(name: 'updated_by')
  String updatedBy;

  Item(
    this.appId,
    this.checkType,
    this.checkedAt,
    this.checkedBy,
    this.createdAt,
    this.createdBy,
    this.datastoreId,
    this.itemId,
    this.items,
    this.labelTime,
    this.owners,
    this.checkStatus,
    this.status,
    this.updatedAt,
    this.updatedBy,
  );

  factory Item.fromJson(Map<String, dynamic> srcJson) => _$ItemFromJson(srcJson);

  Map<String, dynamic> toJson() => _$ItemToJson(this);
}

@JsonSerializable()
class Value extends Object {
  @JsonKey(name: 'value')
  dynamic value;

  @JsonKey(name: 'data_type')
  String dataType;

  Value(
    this.value,
    this.dataType,
  );

  factory Value.fromJson(Map<String, dynamic> srcJson) => _$ValueFromJson(srcJson);

  Map<String, dynamic> toJson() => _$ValueToJson(this);
}
