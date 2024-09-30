import 'package:json_annotation/json_annotation.dart';

part 'display_field.g.dart';

@JsonSerializable()
class DisplayField extends Object {
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

  @JsonKey(name: 'display_order')
  int displayOrder;

  DisplayField({this.id, this.datastoreId, this.fieldId, this.fieldName, this.fieldType, this.displayOrder});

  factory DisplayField.fromJson(Map<String, dynamic> srcJson) => _$DisplayFieldFromJson(srcJson);

  Map<String, dynamic> toJson() => _$DisplayFieldToJson(this);
}
