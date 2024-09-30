import 'package:json_annotation/json_annotation.dart';

part 'option.g.dart';

List<Option> getOptionList(List<dynamic> list) {
  List<Option> result = [];
  list.forEach((item) {
    result.add(Option.fromJson(item));
  });
  return result;
}

@JsonSerializable()
class Option extends Object {
  @JsonKey(name: 'option_id')
  String optionId;

  @JsonKey(name: 'option_value')
  String optionValue;

  @JsonKey(name: 'option_label')
  String optionLabel;

  @JsonKey(name: 'option_name')
  String optionName;

  @JsonKey(name: 'option_memo')
  String optionMemo;

  @JsonKey(name: 'app_id')
  String appId;

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

  Option(
    this.optionValue,
    this.optionLabel, {
    this.optionId,
    this.optionName,
    this.optionMemo,
    this.appId,
    this.createdAt,
    this.createdBy,
    this.updatedAt,
    this.updatedBy,
    this.deletedAt,
  });

  factory Option.fromJson(Map<String, dynamic> srcJson) =>
      _$OptionFromJson(srcJson);

  Map<String, dynamic> toJson() => _$OptionToJson(this);
}
