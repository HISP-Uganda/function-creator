import { observable, action, computed } from 'mobx';

import { generateUid } from "../utils";
import { Rule } from "./Rule";
import _ from 'lodash';

export class Indicator {
  @observable id = generateUid();
  @observable name = '';
  @observable description = '';
  @observable rules = [];
  @observable ruleDialogOpen = false;
  @observable rule = new Rule();
  @observable created = new Date();
  @observable lastUpdated = new Date();
  @observable href = `http://localhost:8080/api/dataStore/functions/${this.id}`;
  @observable testDialogOpen = false;
  @observable dialogOpen = false;
  @observable level;

  @observable numeratorDialogOpen = false;
  @observable denominatorDialogOpen = false;

  @observable function = "async function fetchApi(url) {\n" +
    "    const response = await fetch(url);\n" +
    "    return response.json();\n" +
    "}\n" +
    "\n" +
    "async function fetchAnalyticsStructure(periods, orgs) {\n" +
    "    return await fetchApi(`../../../api/analytics.json?dimension=pe:${periods}&dimension=ou:${orgs}&skipData=true&hierarchyMeta=true`);\n" +
    "}\n" +
    "\n" +
    "async function fetchOrganisationsByGroups(allGroups) {\n" +
    "    return await fetchApi(`../../../api/organisationUnitGroups.json?filter=id:in:[${allGroups}]&fields=id,organisationUnits[id]&paging=false`);\n" +
    "}\n" +
    "\n" +
    "async function fetchAnalyticsData(allDataElements, periods, ous) {\n" +
    "    return await fetchApi(`../../../api/analytics.json?dimension=pe:${periods}&dimension=ou:${ous}&dimension=dx:${allDataElements}&hierarchyMeta=true`);\n" +
    "}\n" +
    "\n" +
    "async function call(periods, orgs, rule) {\n" +
    "    try {\n" +
    "\n" +
    "        let num = rule.numerator;\n" +
    "        let den = rule.denominator;\n" +
    "        const indicatorId = rule.id;\n" +
    "\n" +
    "        const dummy = await fetchAnalyticsStructure(periods, orgs);\n" +
    "\n" +
    "        const dimensions = dummy.metaData.dimensions;\n" +
    "\n" +
    "        const numeratorDataElements = num.match(/#{\\w+.?\\w*}/g);\n" +
    "        const denominatorDataElements = den.match(/#{\\w+.?\\w*}/g);\n" +
    "\n" +
    "        const numeratorGroups = num.match(/OU_GROUP{\\w+.?\\w*}/g);\n" +
    "        const denominatorGroups = den.match(/OU_GROUP{\\w+.?\\w*}/g);\n" +
    "\n" +
    "        let allDataElements = [];\n" +
    "        let allGroups = [];\n" +
    "        let allLevels = [];\n" +
    "\n" +
    "        if (numeratorDataElements) {\n" +
    "            const des = numeratorDataElements.map(function(de) {\n" +
    "                const replacement = de.replace(\"#{\", \"\").replace(\"}\", \"\");\n" +
    "                const we = replacement.replace('.', '');\n" +
    "                num = num.replace(de, `obj['${we}']`);\n" +
    "                return replacement\n" +
    "            });\n" +
    "            allDataElements = _.concat(allDataElements, des);\n" +
    "        }\n" +
    "\n" +
    "        if (denominatorDataElements) {\n" +
    "            const des = denominatorDataElements.map(function(de) {\n" +
    "                const replacement = de.replace(\"#{\", \"\").replace(\"}\", \"\");\n" +
    "                const we = replacement.replace('.', '');\n" +
    "                den = den.replace(de, `obj['${we}']`);\n" +
    "                return replacement\n" +
    "            });\n" +
    "            allDataElements = _.concat(allDataElements, des);\n" +
    "        }\n" +
    "\n" +
    "        if (numeratorGroups) {\n" +
    "            const gps = numeratorGroups.map(function(oug) {\n" +
    "                const replacement = oug.replace(\"OU_GROUP{\", \"\").replace(\"}\", \"\");\n" +
    "                num = num.replace(oug, `!!filterGroups.${replacement}.find(function(x){return obj.ou.indexOf(x) !== -1})`);\n" +
    "                return replacement\n" +
    "            });\n" +
    "            allGroups = _.concat(allGroups, gps);\n" +
    "        }\n" +
    "\n" +
    "        if (denominatorGroups) {\n" +
    "            const gps = denominatorGroups.map(function(oug) {\n" +
    "                const replacement = oug.replace(\"OU_GROUP{\", \"\").replace(\"}\", \"\");\n" +
    "                den = den.replace(oug, `!!filterGroups.${replacement}.find(function(x){return obj.ou.indexOf(x) !== -1})`);\n" +
    "                return replacement;\n" +
    "            });\n" +
    "            allGroups = _.concat(allGroups, gps);\n" +
    "        }\n" +
    "\n" +
    "        let filterGroups = {};\n" +
    "\n" +
    "        if (allGroups.length > 0) {\n" +
    "            const groups = await fetchOrganisationsByGroups(allGroups.join(','));\n" +
    "            const processedGroups = groups.organisationUnitGroups.map(function(gp) {\n" +
    "                const units = gp.organisationUnits.map(function(o) {\n" +
    "                    return o.id;\n" +
    "                });\n" +
    "                return [gp.id, units];\n" +
    "            });\n" +
    "            filterGroups = _.fromPairs(processedGroups);\n" +
    "        }\n" +
    "        if (rule.level) {\n" +
    "            orgs = `${orgs};${rule.level}`;\n" +
    "        }\n" +
    "\n" +
    "        const data = await fetchAnalyticsData(allDataElements.join(';'), periods, orgs);\n" +
    "\n" +
    "        const whatToGroup = data.rows.map(function(r) {\n" +
    "            const obj = _.fromPairs([\n" +
    "                [r[0].replace('.', ''), parseFloat(r[3])],\n" +
    "                ['pe', r[1]],\n" +
    "                ['ou', `${data.metaData.ouHierarchy[r[2]]}/${r[2]}`],\n" +
    "            ]);\n" +
    "            return obj;\n" +
    "        });\n" +
    "\n" +
    "        const grouped = _.groupBy(whatToGroup, function(x) {\n" +
    "            return `${x.pe}${x.ou}`;\n" +
    "        });\n" +
    "\n" +
    "        const searches = _.keys(grouped).map(function(x) {\n" +
    "            const val = grouped[x];\n" +
    "            const obj = Object.assign.apply(Object, val);\n" +
    "            const what = _.pick(obj, ['pe', 'ou']);\n" +
    "            what.numerator = eval(num) ? 1 : 0;\n" +
    "            what.denominator = eval(den) ? 1 : 0;\n" +
    "            return what;\n" +
    "        });\n" +
    "\n" +
    "        const pp = dimensions.ou.map(function(o) {\n" +
    "            return _(searches.filter(function(s) {\n" +
    "                return s.ou.indexOf(o) !== -1\n" +
    "            })).groupBy('pe').map((objs, key) => {\n" +
    "                const numerator = _.sumBy(objs, 'numerator');\n" +
    "                const denominator = _.sumBy(objs, 'denominator');\n" +
    "                let value = 0;\n" +
    "\n" +
    "                if (denominator !== 0) {\n" +
    "                    value = String(Number(numerator * 100 / denominator).toFixed(2));\n" +
    "                }\n" +
    "                return {\n" +
    "                    'pe': key,\n" +
    "                    'value': value\n" +
    "                }\n" +
    "            }).value().map(function(vv) {\n" +
    "                return [indicatorId, vv.pe, o, vv.value];\n" +
    "            });\n" +
    "        });\n" +
    "\n" +
    "        dummy.metaData.items[indicatorId] = {\n" +
    "            name: rule.name\n" +
    "        };\n" +
    "        dummy.metaData.dimensions.dx = [indicatorId];\n" +
    "        dummy.rows = _.flatten(pp);\n" +
    "        dummy.height = _.flatten(pp).length;\n" +
    "        dummy.width = 4;\n" +
    "        dummy.headers = [{\n" +
    "            \"name\": \"dx\",\n" +
    "            \"column\": \"Data\",\n" +
    "            \"valueType\": \"TEXT\",\n" +
    "            \"type\": \"java.lang.String\",\n" +
    "            \"hidden\": false,\n" +
    "            \"meta\": true\n" +
    "        }, {\n" +
    "            \"name\": \"pe\",\n" +
    "            \"column\": \"Period\",\n" +
    "            \"valueType\": \"TEXT\",\n" +
    "            \"type\": \"java.lang.String\",\n" +
    "            \"hidden\": false,\n" +
    "            \"meta\": true\n" +
    "        }, {\n" +
    "            \"name\": \"ou\",\n" +
    "            \"column\": \"Organisation unit\",\n" +
    "            \"valueType\": \"TEXT\",\n" +
    "            \"type\": \"java.lang.String\",\n" +
    "            \"hidden\": false,\n" +
    "            \"meta\": true\n" +
    "        }, {\n" +
    "            \"name\": \"value\",\n" +
    "            \"column\": \"Value\",\n" +
    "            \"valueType\": \"NUMBER\",\n" +
    "            \"type\": \"java.lang.Double\",\n" +
    "            \"hidden\": false,\n" +
    "            \"meta\": false\n" +
    "        }];\n" +
    "        parameters.success(dummy);\n" +
    "\n" +
    "    } catch (e) {\n" +
    "        parameters.error({});\n" +
    "\n" +
    "    }\n" +
    "}\n" +
    "\n" +
    "call(parameters.pe, parameters.ou, parameters.rule);";

  @action
  setNumerator = event => {
    this.rule.numerator = event.target.value;
    this.rule.numeratorSelectionEnd = event.target.selectionStart;
  };

  @action setLevel = val => this.level = val;

  @action
  setDenominator = event => {
    this.rule.denominator = event.target.value;
    this.rule.denominatorSelectionEnd = event.target.selectionStart;
  };

  @action
  onClickNumerator = event => {
    this.numeratorSelectionEnd = event.target.selectionStart;
  };

  @action
  onClickDenominator = event => {
    this.denominatorSelectionEnd = event.target.selectionStart;
  };


  @action
  handleNumeratorPadClick = id => {
    if (this.rule.numeratorSelectionEnd === 0) {
      this.rule.numerator = id + this.rule.numerator;
      this.rule.numeratorSelectionEnd = this.rule.numerator.length;
    } else if (this.numeratorSelectionEnd === this.rule.numerator.length) {
      this.rule.numerator = this.rule.numerator + id;
      this.selectionEnd = this.rule.numerator.length;
    } else {
      const startString = this.rule.numerator.substring(0, this.rule.numeratorSelectionEnd) + id;
      const endString = this.rule.numerator.substring(this.rule.numeratorSelectionEnd, this.rule.numerator.length);
      this.rule.numerator = startString + endString;
      this.rule.numeratorSelectionEnd = startString.length;
    }
  };

  @action
  handleDenominatorPadClick = id => {
    if (this.rule.denominatorSelectionEnd === 0) {
      this.rule.denominator = id + this.rule.denominator;
      this.rule.denominatorSelectionEnd = this.rule.denominator.length;
    } else if (this.denominatorSelectionEnd === this.rule.denominator.length) {
      this.rule.denominator = this.rule.denominator + id;
      this.selectionEnd = this.rule.denominator.length;
    } else {
      const startString = this.rule.denominator.substring(0, this.rule.denominatorSelectionEnd) + id;
      const endString = this.rule.denominator.substring(this.rule.denominatorSelectionEnd, this.rule.denominator.length);
      this.rule.denominator = startString + endString;
      this.rule.denominatorSelectionEnd = startString.length;
    }
  };


  @action
  onNumeratorClick = event => {
    this.rule.numeratorSelectionEnd = event.target.selectionStart;
  };

  @action
  onDenominatorClick = event => {
    this.rule.denominatorSelectionEnd = event.target.selectionStart;
  };

  @action setNumeratorDialogOpen = val => this.numeratorDialogOpen = val;
  @action setDenominatorDialogOpen = val => this.denominatorDialogOpen = val;

  @action setSelectionEnd = (val) => this.selectionEnd = val;
  @action setId = (val) => this.id = val;
  @action setName = (val) => this.name = val;
  @action setDescription = (val) => this.description = val;
  @action setDialogOpen = (val) => this.dialogOpen = val;
  @action setRuleDialogOpen = (val) => this.ruleDialogOpen = val;
  @action setCondition = (val) => this.condition = val;
  @action setRule = (val) => this.rule = val;
  @action setRules = (val) => this.rules = val;
  @action setFunction = (val) => this.function = val;

  @action openNumeratorDialog = () => this.setNumeratorDialogOpen(true);
  @action openDenominatorDialog = () => this.setDenominatorDialogOpen(true);

  @action closeNumeratorDialog = () => this.setNumeratorDialogOpen(false);
  @action closeDenominatorDialog = () => this.setDenominatorDialogOpen(false);


  @action valueChangeName = (event) => {
    this.setName(event.target.value);
  };

  @action valueChangeDescription = (event) => {
    this.setDescription(event.target.value);
  };

  @action valueChange = (what) => (event) => {
    if (what === 1) {
      this.setNumerator(event.target.value);
    } else if (what === 2) {
      this.setDenominator(event.target.value);
    }
    this.setSelectionEnd(event.target.selectionStart);
  };

  @action onClick = (event) => {
    this.setSelectionEnd(event.target.selectionStart);
  };

  @action addRule = () => {
    this.rule.name = this.name;
    this.rule.description = this.description;
    this.setRules([this.rule]);
  };

  @action setCurrentRule = (val) => () => {
    this.setRule(val);
    this.openRuleDialog();
  };

}
