import {observable, action} from "mobx";
import {Json} from "./Json";
import {generateUid} from "../utils";

export class Rule {
    @observable id = generateUid();
    @observable type = 'FUNCTION_RULE';
    @observable name = '';
    @observable json = new Json();
    @observable description = '';
    @observable isDefault = false;
    @observable numIsOuCount = true;
    @observable denIsOuCount = true;

    @action
    onChangeNum = (e) => this.numIsOuCount = e.target.checked;

    @action
    onChangeDen = (e) => this.denIsOuCount = e.target.checked;
}
