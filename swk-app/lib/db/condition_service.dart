import 'package:pit3_app/db/db_helper.dart';
import 'package:pit3_app/core/models/search_condition.dart';
import 'package:sqflite/sqflite.dart';
import 'dart:async';

class ConditionService {
  static final ConditionService _instance = ConditionService.internal();
  factory ConditionService() => _instance;

  final String tableName = "table_search_condition";

  static Database _db;

  Future<Database> get db async {
    if (_db != null) {
      return _db;
    }
    _db = await DBHelper.internal().db;
    return _db;
  }

  ConditionService.internal();

  //插入
  Future<int> saveItem(SearchCondition item) async {
    var dbClient = await db;
    int res = await dbClient.insert("$tableName", item.toJson());
    print(res.toString());
    return res;
  }

  //查询
  Future<List> getConditionList() async {
    var dbClient = await db;
    var result = await dbClient.rawQuery("SELECT * FROM $tableName ");
    return result;
  }

  //查询总数
  Future<int> getCount() async {
    var dbClient = await db;
    return Sqflite.firstIntValue(
        await dbClient.rawQuery("SELECT COUNT(*) FROM $tableName"));
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
