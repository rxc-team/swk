async function run() {
    // Connect the client to the server
    await client.connect();

    // 日志情报
    const change = {};

    // 获取系统所有客户情报
    const database = "pit"
    const pit = client.db(database);
    const cc = pit.collection("customers");
    const customers = await cc.find().toArray();

    //在pit下的users表中创建索引
    const users = pit.collection("users");
    await users.createIndex(
        { "user_id": 1 },
        { sparse: true }
    );
    console.log("共通users表中创建索引完成")

    //在pit下的task_histories表中创建索引
    const ts = pit.collection("task_histories");
    await ts.createIndex(
        { "app_id": 1 , "job_id": -1},
        { sparse: true }
    );
    console.log("共通task_histories表中创建索引完成")

    //在pit_system下的messages表中创建索引
    const pit_sys = client.db(database + "_system");
    const messages = pit_sys.collection("messages");
    await messages.createIndex(
        { "recipient": 1, "domain": 1, "status": 1, "msg_type": 1 },
        { sparse: true }
    );
    console.log("共通system下的messages表中创建索引完成")

    //在pit_system下的actions表中创建索引
    const actions = pit_sys.collection("actions");
    await actions.createIndex(
        { "action_group": 1 },
        { sparse: true }
    );
    console.log("共通system下的actions表中创建索引完成")

    /* 顾客为空的场合直接返回 */
    if (!customers || customers.length === 0) {
        change["処理概要開-始"] = "顧客が存在しない、処理しない";
        return change;
    }

    // 処理対象
    change["処理概要"] =
        "処理対象顧客が" + customers.length + "個存在し、処理開始：";

    let acount = 0;
    /* 循环所有顾客，更新数据 */
    for (let i = 0; i < customers.length; i++) {
        // 单个顾客情报
        const cs = customers[i];
        const db = client.db(database + `_${cs.customer_id}`);
        console.log("处理顾客：" + cs.customer_id)

        /* 查找顾客下options表 */
        const options = db.collection("options");
        // 创建options索引
        await options.createIndex(
            { "app_id": 1, "option_id": 1, "option_value": 1 },
            { sparse: true }
        );
        console.log("options表中创建索引完成")

        /* 查找顾客下languages表 */
        const languages = db.collection("languages");
        // 创建languages索引
        await languages.createIndex(
            { "domain": 1, "lang_cd": 1 },
            { sparse: true }
        );
        console.log("languages表中创建索引完成")

        /* 查找顾客下users表 */
        const user = db.collection("users");
        // 创建users索引
        await user.createIndex(
            { "user_id": 1 },
            { sparse: true }
        );
        console.log("users表中创建索引完成")

        acount++;
    }
    console.log("结束")
    change["処理概要-indexの追加"] = "顾客更新数：" + acount;
    change["処理概要-終"] = "処理が正常に終了しました";

    return change
}