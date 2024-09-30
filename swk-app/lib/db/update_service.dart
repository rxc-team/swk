import 'package:pit3_app/db/db_helper.dart';
import 'package:pit3_app/core/models/update_condition.dart';
import 'package:sqflite/sqflite.dart';
import 'dart:async';

class UpdateService {
  static final UpdateService _instance = UpdateService.internal();
  factory UpdateService() => _instance;

  final String tableName = "table_update_condition";

  static Database _db;

  Future<Database> get db async {
    if (_db != null) {
      return _db;
    }
    _db = await DBHelper.internal().db;
    return _db;
  }

  UpdateService.internal();

  //插入
  Future<int> saveItem(UpdateCondition item) async {
    var dbClient = await db;
    int res = await dbClient.insert("$tableName", item.toJson());
    print(res.toString());
    return res;
  }

  //查询
  Future<List> getConditionList(String ds) async {
    var dbClient = await db;
    var result = await dbClient.rawQuery(
      "SELECT * FROM $tableName where datastore_id=?",
      [ds],
    );
    return result;
  }

  //清空数据
  Future<int> clear() async {
    var dbClient = await db;
    return await dbClient.delete(tableName);
  }

  //根据id删除
  Future<int> deleteItem(int id) async {
    var dbClient = await db;
    return await dbClient.delete(tableName, where: "id = ?", whereArgs: [id]);
  }

  //关闭
  Future close() async {
    var dbClient = await db;
    return dbClient.close();
  }
}
