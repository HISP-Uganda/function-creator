import {action, observable} from "mobx";
import {Condition} from "./Condition";

export class Json {
    @observable numerator = '';
    @observable denominator = '';
    @observable conditions = [];

    @action setNumerator = (val) => this.numerator = val;
    @action setDenominator = (val) => this.denominator = val;
}
