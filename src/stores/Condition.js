import {action, computed, observable} from "mobx";
import {generateUid} from "../utils";

export class Condition {
    @observable type = '';
    @observable comparator = 'None';
    @observable name = '';
    @observable value = '';
    @observable dataElement = '';
    @observable active = '1';
    @observable comparator1 = '';
    @observable condition1 = '';
    @observable condition2 = '';
    @observable id = generateUid();
    @observable sortId = 1;
    @observable lastMonths = 0;
    @observable ouGroups = [];
    @observable ouLevels = [];
    @observable aggregationType = 'SUM';
    @observable otherCalculation = '';


    @action setType = (val) => {
        this.setValue('');
        this.setComparator('None');
        this.setDataElement('');
        this.setValue('');
        this.type = val;

        if (this.type === 'dataElement') {
            this.setActive('1');
        } else if (this.type === 'group') {
            this.setActive('2')
        } else if (this.type === 'level') {
            this.setActive('3')
        } else if (this.type === 'dataSet') {
            this.setActive('4')
        } else if (this.type === 'indicator') {
            this.setActive('5')
        }
    };
    @action setComparator = (val) => {
        this.comparator = val;
        this.setValue('');
    };

    @action setComparator1 = (val) => {
        this.comparator1 = val;
        this.setValue('');
    };

    @action setCondition1 = (val) => {
        this.condition1 = val;
    };

    @action setCondition2 = (val) => {
        this.condition2 = val;
    };

    @action setName = (val) => this.name = val;
    @action setValue = (val) => this.value = val;
    @action setDataElement = (val) => this.dataElement = val;
    @action setActive = (val) => this.active = val;
    @action setId = (val) => this.id = val;
    @action setOuLevels = (val) => this.ouLevels = val;
    @action setOuGroups = (val) => this.ouGroups = val;
    @action setLastMonths = (val) => this.lastMonths = val;
    @action onAggregationTypeChange = (val) => this.aggregationType = val;
    @action valueChangeOtherCalculation = (event) => this.otherCalculation = event.target.value;



    @action valueChangeLastMonths = (event) => {
        this.setLastMonths(event.target.value);
    };

    @action valueChangeDescription = (event) => {
        this.setValue(event.target.value);
    };

    @action valueChangeName = (event) => {
        this.setName(event.target.value);
    };


    @action setCurrentDataElement = (val) => () => {
        if (this.type === 'dataElement' || this.type === 'dataSet' || this.type === 'indicator') {
            this.setDataElement(val);
        }
    };

    @action setOrganisationLevel = (val) => () => {
        if (this.type === 'level' && this.comparator !== '' && this.comparator === 'IN' && this.value !== '') {
            const current = this.value + ',' + val;
            this.setValue(current);
        } else if (this.type === 'level' && this.comparator !== '') {
            this.setValue(val);
        }
    };

    @action setOrganisationGroup = (val) => () => {
        if (this.type === 'group' && this.comparator !== '' && this.comparator === 'IN' && this.value !== '') {
            const current = this.value + ',' + val;
            this.setValue(current);
        } else if (this.type === 'group' && this.comparator !== '') {
            this.setValue(val);
        }
    };

    @computed get disableButton() {
        return this.name === '' || this.comparator === '' || (this.type === 'dataElement' ? this.dataElement === '' : this.type === '' && this.value === '');
    }
}
