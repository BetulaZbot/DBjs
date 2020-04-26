import base from './lib/Base'
import db, { Storage } from './lib/db'
import table from './lib/table'
const setMode = (isStrict) => {
    base.isStrict = isStrict;
}
function setState(param?: string) {
    return (target: Object,
        propertyKey: string,
        descriptor: TypedPropertyDescriptor<any>) => {
        if (!target["$param"]) {
            target["$param"] = [param || propertyKey]
        } else {
            target["$param"].push(param || propertyKey);
        }
        return descriptor;
    }
}
export { db, table, setMode, Storage, setState };