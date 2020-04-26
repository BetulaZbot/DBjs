import Base from "./Base"
import { table } from "..";
interface Storage {
    setItem: Function;
    getItem: Function;
}
export { Storage }

abstract class DB extends Base {
    static storage: Storage;//存储
    static _dataTobeSaved = {};//
    static _querySavedDataList = [];//
    static dataFlag: number = 0;//0,等待,1,已恢复

    static config: any = {}

    //保存数据到localStorage
    static DataSave() {
        for (let key in DB._dataTobeSaved) {
            let { save, cacheTime } = DB._dataTobeSaved[key];
            DB.storage && DB.storage.setItem(key, save(), cacheTime);
        }
    }
    //从localStorage读取保存数据
    static DataRec() {
        DB._querySavedDataList.map((query) => {
            query.resolve(DB.storage.getItem(query.key));
        })
        DB.dataFlag = 1
    }
    $key: string//此db的名字,用于数据缓存
    $cacheTime: number = 0//缓存时间,0默认为数据永久缓存
    $updateView: Function
    $type: string = "DB";


    constructor(key: string, updateView: Function) {
        super();
        this.$DB = new Map();
        this.$index = 0;
        this.$key = key;
        this.$updateView = updateView;

        this.$THIS = this;
    }
    //生产STATE
    public produceState(table?: table) {
        if (table && table.$type === 'TABLE') {
            //判断是不是顶级table
            while (table.$PARENT.$type === 'TABLE') {
                table = table.$PARENT;
            }
            return { [table.$name + 'List']: this.getTableState(table.$name) }
        } else {
            return this.produce();
        }
    }
    private exe(table: any, functionName: string, ...param) {
        let rst = null;
        if (table.$type == "DB") {
            rst = this[functionName](...param)
        } else {
            rst = this.$tableMap.get(table.$id)[functionName](...param)
        }
        return rst;
    }
    //提交修改
    public commit(table: any, functionName: string, callback?: Function, ...param) {
        let rst = this.query(table, functionName, ...param);
        this.$updateView(callback, table);
        return rst;
    }
    public query(table: any, functionName: string, ...param) {
        return this.exe(table, functionName, ...param);
    }
    public recover(table: any) {
        return this.$tableMap.get(table.$id);
    }
    get config() {
        return DB.config;
    }
    public registerDataOp(cacheTime?: number) {
        cacheTime == null && (cacheTime = 0)
        DB._dataTobeSaved[this.$key] = { save: this.sendSavedData.bind(this), cacheTime: cacheTime };
        this.$cacheTime = cacheTime;
    }
    public unRegisterDataOp() {
        DB._dataTobeSaved[this.$key] = null;
    }
    sendSavedData(): any {

    };
    public async getSavedData() {
        switch (DB.dataFlag) {
            case 0:
                return new Promise((resolve) => {
                    DB._querySavedDataList.push({
                        resolve: resolve,
                        key: this.$key,
                        cacheTime: this.$cacheTime
                    });
                });

            case 1:
                return Promise.resolve(DB.storage.getItem(this.$key, this.$cacheTime));
            default:
                break;
        }

    }

    public onDestroy() {
        this.unRegisterDataOp();
    }

}

export default DB