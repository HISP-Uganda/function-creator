import {observable, action} from "mobx";
import {generateUid} from "../utils";

export class Rule {
  @observable id = generateUid();
  @observable type = 'FUNCTION_RULE';
  @observable name = '';
  @observable description = '';
  @observable isDefault = false;
  @observable numIsOuCount = true;
  @observable denIsOuCount = true;
  @observable numerator = '';
  @observable denominator = '';
  @observable level;


  @action setNumerator = (val) => this.numerator = val;
  @action setDenominator = (val) => this.denominator = val;

  @action setLevel = val => this.level = val;
}
