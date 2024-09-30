import 'package:json_annotation/json_annotation.dart';

part 'lang.g.dart';

@JsonSerializable()
class Lang extends Object {
  @JsonKey(name: 'apps')
  Map<String, App> apps;

  @JsonKey(name: 'common')
  Common common;

  Lang(this.apps, this.common);

  factory Lang.fromJson(Map<String, dynamic> srcJson) =>
      _$LangFromJson(srcJson);

  Map<String, dynamic> toJson() => _$LangToJson(this);
}

@JsonSerializable()
class App extends Object {
  @JsonKey(name: 'app_name')
  String appName;

  @JsonKey(name: 'datastores')
  Map<String, String> datastores;

  @JsonKey(name: 'fields')
  Map<String, String> fields;

  @JsonKey(name: 'options')
  Map<String, String> options;

  App(this.appName, this.datastores, this.fields, this.options);

  factory App.fromJson(Map<String, dynamic> srcJson) => _$AppFromJson(srcJson);

  Map<String, dynamic> toJson() => _$AppToJson(this);
}

@JsonSerializable()
class Common extends Object {
  @JsonKey(name: 'workflows')
  Map<String, String> workflows;

  @JsonKey(name: 'assignes')
  Map<String, String> assignes;

  Common(this.workflows, this.assignes);

  factory Common.fromJson(Map<String, dynamic> srcJson) =>
      _$CommonFromJson(srcJson);

  Map<String, dynamic> toJson() => _$CommonToJson(this);
}
