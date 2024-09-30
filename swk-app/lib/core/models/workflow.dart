import 'package:json_annotation/json_annotation.dart';

part 'workflow.g.dart';

List<Workflow> getWorkflowList(List<dynamic> list) {
  List<Workflow> result = [];
  list.forEach((item) {
    result.add(Workflow.fromJson(item));
  });
  return result;
}

@JsonSerializable()
class Workflow extends Object {
  @JsonKey(name: 'wf_id')
  String wfId;

  @JsonKey(name: 'wf_name')
  String wfName;

  @JsonKey(name: 'menu_name')
  String menuName;

  @JsonKey(name: 'is_valid')
  bool isValid;

  @JsonKey(name: 'group_id')
  String groupId;

  @JsonKey(name: 'app_id')
  String appId;

  @JsonKey(name: 'accept_or_dismiss')
  bool acceptOrDismiss;

  @JsonKey(name: 'workflow_type')
  String workflowType;

  @JsonKey(name: 'params')
  Params params;

  @JsonKey(name: 'created_at')
  String createdAt;

  @JsonKey(name: 'created_by')
  String createdBy;

  @JsonKey(name: 'updated_at')
  String updatedAt;

  @JsonKey(name: 'updated_by')
  String updatedBy;

  Workflow(
    this.wfId,
    this.wfName,
    this.menuName,
    this.isValid,
    this.groupId,
    this.appId,
    this.acceptOrDismiss,
    this.workflowType,
    this.params,
    this.createdAt,
    this.createdBy,
    this.updatedAt,
    this.updatedBy,
  );

  factory Workflow.fromJson(Map<String, dynamic> srcJson) => _$WorkflowFromJson(srcJson);

  Map<String, dynamic> toJson() => _$WorkflowToJson(this);
}

@JsonSerializable()
class Params extends Object {
  @JsonKey(name: 'action')
  String action;

  @JsonKey(name: 'datastore')
  String datastore;

  @JsonKey(name: 'fields')
  String fields;

  Params(
    this.action,
    this.datastore,
    this.fields,
  );

  factory Params.fromJson(Map<String, dynamic> srcJson) => _$ParamsFromJson(srcJson);

  Map<String, dynamic> toJson() => _$ParamsToJson(this);
}
