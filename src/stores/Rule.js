import {observable} from "mobx";
import {Json} from "./Json";
import {generateUid} from "../utils";

export class Rule {
    @observable id = generateUid();
    @observable type = 'FUNCTION_RULE';
    @observable name = '';
    @observable json = new Json();
    @observable description = '';
    @observable isDefault = false;
}
