import 'package:json_annotation/json_annotation.dart';

part 'update_condition.g.dart';

@JsonSerializable()
class UpdateCondition extends Object {
  @JsonKey(name: 'id')
  int id;

  @JsonKey(name: 'datastore_id')
  String datastoreId;

  @JsonKey(name: 'field_id')
  String fieldId;

  @JsonKey(name: 'field_name')
  String fieldName;

  @JsonKey(name: 'field_type')
  String fieldType;

  @JsonKey(name: 'lookup_datastore_id')
  String lookupDatastoreId;

  @JsonKey(name: 'lookup_field_id')
  String lookupFieldId;

  @JsonKey(name: 'option_id')
  String optionId;

  @JsonKey(name: 'update_value')
  String updateValue;

  UpdateCondition({
    this.id,
    this.datastoreId,
    this.fieldId,
    this.fieldName,
    this.fieldType,
    this.lookupDatastoreId,
    this.lookupFieldId,
    this.optionId,
    this.updateValue,
  });

  factory UpdateCondition.fromJson(Map<String, dynamic> srcJson) =>
      _$UpdateConditionFromJson(srcJson);

  Map<String, dynamic> toJson() => _$UpdateConditionToJson(this);
}
