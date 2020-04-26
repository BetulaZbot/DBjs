import Base from "./Base"
import DB from "./db"
export default class extends Base {
    
    $name: string;
    $type:string = 'TABLE';
    constructor(name: string) {
        super();
        this.$name = name;
    }
    get config() {
        return DB.config;
    }
    get $updateView() {
        return this.$THIS.$updateView;
    }
}