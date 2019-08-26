import {action, computed, observable} from "mobx";
import * as _ from "lodash";

export class Json {
    @observable numerator = '';
    @observable denominator = '';
    @observable conditions = [];

    @observable paging = {
        conditions: {
            page: 0,
            rowsPerPage: 5
        }
    };

    @action setPaging = val => this.paging = val;

    @action
    handleChangeElementPage = what => (event, page) => {
        const current = this.paging[what];
        const change = {};
        if (current) {
            change.page = page;
            change.rowsPerPage = current.rowsPerPage;
            const data = _.fromPairs([
                [what, change]
            ]);

            const p = {
                ...this.paging,
                ...data
            };

            this.setPaging(p);
        }
    };

    @action
    handleChangeElementRowsPerPage = what => event => {
        const current = this.paging[what];
        const change = {};
        if (current) {
            change.rowsPerPage = event.target.value;
            change.page = current.page;
            const data = _.fromPairs([
                [what, change]
            ]);
            const p = {
                ...this.paging,
                ...data
            };

            this.setPaging(p);
        }
    };

    @action setNumerator = (val) => this.numerator = val;
    @action setDenominator = (val) => this.denominator = val;

    @computed get pagedConditions(){
        const info = this.paging['conditions'];
        return this.conditions.slice(info.page * info.rowsPerPage, info.page * info.rowsPerPage + info.rowsPerPage);
    }
}
