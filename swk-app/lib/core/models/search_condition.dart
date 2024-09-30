import 'package:json_annotation/json_annotation.dart';

part 'search_condition.g.dart';

@JsonSerializable()
class SearchCondition extends Object {
  @JsonKey(name: 'id')
  int id;

  @JsonKey(name: 'field_id')
  String fieldId;

  @JsonKey(name: 'field_name')
  String fieldName;

  @JsonKey(name: 'field_type')
  String fieldType;

  @JsonKey(name: 'operator')
  String searchOperator;

  @JsonKey(name: 'search_value')
  String searchValue;

  @JsonKey(name: 'condition_type')
  String conditionType;

  @JsonKey(name: 'is_dynamic')
  bool isDynamic;

  SearchCondition({
    this.id,
    this.fieldId,
    this.fieldName,
    this.fieldType,
    this.searchOperator,
    this.conditionType,
    this.searchValue,
    this.isDynamic,
  });

  factory SearchCondition.fromJson(Map<String, dynamic> srcJson) =>
      _$SearchConditionFromJson(srcJson);

  Map<String, dynamic> toJson() => _$SearchConditionToJson(this);
}
