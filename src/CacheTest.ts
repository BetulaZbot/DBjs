import { db } from './index'

let mStorage = {};
const uniqueKey = "98789";

class test1 extends db {
    person
    constructor() {
        super("test1",()=>{});
        this.registerDataOp();
        this.person = { name: 'xiaomin', age: Math.random() * 100 }
    }
    sendSavedData() {
        return this.person;
    }
    async rec() {
        this.person = await this.getSavedData()
        console.log("数据恢复完成:", this.person)
    }
}

let t1 = new test1();

db.storage = {
    setItem: (key, value) => {
        mStorage[key + '@' + uniqueKey] = value;
    },
    getItem: (key) => {
        return mStorage[key + '@' + uniqueKey];
    }
}

db.DataSave();

console.log("数据存储完成:", mStorage, t1.person)

t1 = new test1();

console.log("测试类重建完成:", t1.person)

db.DataRec();

t1.rec();




