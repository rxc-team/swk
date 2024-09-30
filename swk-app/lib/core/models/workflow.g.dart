// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'workflow.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Workflow _$WorkflowFromJson(Map<String, dynamic> json) {
  return Workflow(
    json['wf_id'] as String,
    json['wf_name'] as String,
    json['menu_name'] as String,
    json['is_valid'] as bool,
    json['group_id'] as String,
    json['app_id'] as String,
    json['accept_or_dismiss'] as bool,
    json['workflow_type'] as String,
    json['params'] == null
        ? null
        : Params.fromJson(json['params'] as Map<String, dynamic>),
    json['created_at'] as String,
    json['created_by'] as String,
    json['updated_at'] as String,
    json['updated_by'] as String,
  );
}

Map<String, dynamic> _$WorkflowToJson(Workflow instance) => <String, dynamic>{
      'wf_id': instance.wfId,
      'wf_name': instance.wfName,
      'menu_name': instance.menuName,
      'is_valid': instance.isValid,
      'group_id': instance.groupId,
      'app_id': instance.appId,
      'accept_or_dismiss': instance.acceptOrDismiss,
      'workflow_type': instance.workflowType,
      'params': instance.params,
      'created_at': instance.createdAt,
      'created_by': instance.createdBy,
      'updated_at': instance.updatedAt,
      'updated_by': instance.updatedBy,
    };

Params _$ParamsFromJson(Map<String, dynamic> json) {
  return Params(
    json['action'] as String,
    json['datastore'] as String,
    json['fields'] as String,
  );
}

Map<String, dynamic> _$ParamsToJson(Params instance) => <String, dynamic>{
      'action': instance.action,
      'datastore': instance.datastore,
      'fields': instance.fields,
    };
