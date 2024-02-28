import { ObjectType } from "..";

export let $uid = (uids: ObjectType) => 
    (uidName: string) => `${uidName}-${uids[uidName]}`;