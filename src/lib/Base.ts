import table from "./table"

abstract class Base {

    static isStrict: boolean = true//全局是否采用严格模式
    $id: number;
    $DB: any
    $index: number//每一次操作都会加1
    $temTables: any[]
    $isStrict: boolean = true//本类是否采用严格模式
    $THIS: any//指向根DB
    $parentIndex: number
    $tables: String[] = [];//每一张表的名称
    $param: String[];//设置需要生成state时需要被添加的getter的名称
    $tableMap: Map<number, table> = new Map();//root节点快捷指向当前每一个表的指针
    constructor() {
        this.$DB = new Map();
        this.$id = 0;
        this.$index = 0;
        this.$isStrict = Base.isStrict;
    }
    get $PARENT() {
        if (this.$parentIndex === 0) return this.$THIS;
        return this.$THIS.recover({ $id: this.$parentIndex });
    }
    private getOpreateId(): number {
        return ++this.$THIS.$index;
    }
    public produce(): any {
        //生成基本属性
        let state: any = { $isPure: true };

        Object.getOwnPropertyNames(this).forEach((key) => {
            if (['$THIS', '$parentIndex', '$isStrict', '$tableMap', '$param', '$tables', '$temTables', '$DB'].indexOf(key) == -1 && ['string', 'object', 'number', 'boolean'].indexOf(typeof this[key]) >= 0) {
                state[key] = this[key];
            }

        })
        //遍历表格
        this.$tables.map(($name: string) => {
            state[$name + 'List'] = this.getTableState($name);
        })
        this.$param && this.$param.map(($key: string) => {
            let paramList = $key.replace(/\s+/g, ' ').split(' ');
            if (paramList.length == 3) {
                state[paramList[2]] = this.getProperty(paramList[0]);
            } else {
                state[$key] = this.getProperty($key);
            }

        })
        return state;
    }
    private getProperty(name) {
        if (typeof this[name] == 'function') {
            return this[name]();
        } else {
            return this[name];
        }
    }
    public getTableState($name: string): any {
        return this.selectFrom($name).findAll().map((table: table) => {
            return table.produce();
        });
    }
    public initTable($name: string) {
        this.$DB.has($name) || (this.$DB.set($name, new Map()) && this.$tables.push($name));
    }
    public initTables($names: string[] = []) {
        $names.map(($name) => {
            this.$DB.has($name) || (this.$DB.set($name, new Map()) && this.$tables.push($name))
        })
    }
    public save(table: table) {
        table.$id = this.getOpreateId();
        table.$THIS = this.$THIS;
        table.$parentIndex = this.$id;
        this.$isStrict || this.$DB.has(table.$name) || (this.$DB.set(table.$name, new Map() && this.$tables.push(table.$name)))
        this.$DB.get(table.$name).set(table.$id, table);
        //在根db建立map表
        this.$THIS.$tableMap.set(table.$id, table);
    }
    public saveAll(tableList: any) {
        tableList.map((table) => {
            this.save(table)
        });
    }
    public delete(table: table) {
        this.$DB.get(table.$name).delete(table.$id);
        this.$THIS.$tableMap.delete(table.$id, table);
    }
    public deleteAll(tableName: string) {
        this.selectFrom(tableName).findAll().map((table) => {
            this.delete(table);
        })
    }
    //获取数据
    public selectFrom($name: string) {
        let tables = this.$DB.get($name);
        let rst = [];
        if (tables) {
            for (let value of tables.values()) {
                rst.push(value);
            }
        }
        this.$temTables = rst;
        return this;
    }
    public where(condition: string) {
        let rst = [];
        this.$temTables.map((value) => {
            if (eval(`value.${condition}`)) {
                rst.push(value);
            }
        })
        this.$temTables = rst;
        return this;
    }
    public orderBy(colum, order) {
        this.$temTables = this.$temTables.sort((a, b) => {
            let aValue = a[colum], bValue = b[colum];

            (typeof aValue) == 'function' && (aValue = a[colum]());
            (typeof bValue) == 'function' && (bValue = b[colum]());

            if (order) {
                return bValue - aValue
            } else {
                return aValue - bValue
            }
        });
        return this;
    }
    public findAll(isPure?: boolean) {
        return !isPure ? this.$temTables : this.$temTables.map((t) => {
            return t.produce()
        });
    }
    public findFirst(isPure?: boolean) {
        return this.$temTables.length > 0 ? !isPure ? this.$temTables[0] : this.$temTables[0].produce() : null;
    }
    public findLast(isPure?: boolean) {
        return this.$temTables.length > 0 ? !isPure ? this.$temTables[this.$temTables.length - 1] : this.$temTables[this.$temTables.length - 1].produce() : null;
    }


}

export default Base