import {observable, action, computed} from 'mobx';

import {generateUid} from "../utils";
import {Rule} from "./Rule";
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

  @observable function = "asyncfunctionfetchApi(url){constresponse=awaitfetch(url);returnresponse.json();}asyncfunctionfetchAnalyticsStructure(periods,orgs){returnawaitfetchApi(`../../../api/analytics.json?dimension=pe:${periods}&dimension=ou:${orgs}&skipData=true&hierarchyMeta=true`);}asyncfunctionfetchOrganisationsByGroups(allGroups){returnawaitfetchApi(`../../../api/organisationUnitGroups.json?filter=id:in:[${allGroups}]&fields=id,organisationUnits[id]&paging=false`);}asyncfunctionfetchAnalyticsData(allDataElements,periods,ous){returnawaitfetchApi(`../../../api/analytics.json?dimension=pe:${periods}&dimension=ou:${ous}&dimension=dx:${allDataElements}&hierarchyMeta=true`);}asyncfunctioncall(periods,orgs,rule){try{letnum=rule.numerator;letden=rule.denominator;constindicatorId=rule.id;constdummy=awaitfetchAnalyticsStructure(periods,orgs);constdimensions=dummy.metaData.dimensions;constnumeratorDataElements=num.match(/#{\\w+.?\\w*}/g);constdenominatorDataElements=den.match(/#{\\w+.?\\w*}/g);constnumeratorGroups=num.match(/OU_GROUP{\\w+.?\\w*}/g);constdenominatorGroups=den.match(/OU_GROUP{\\w+.?\\w*}/g);letallDataElements=[];letallGroups=[];letallLevels=[];if(numeratorDataElements){constdes=numeratorDataElements.map(function(de){constreplacement=de.replace(\"#{\",\"\").replace(\"}\",\"\");constwe=replacement.replace('.','');num=num.replace(de,`obj['${we}']`);returnreplacement});allDataElements=_.concat(allDataElements,des);}if(denominatorDataElements){constdes=denominatorDataElements.map(function(de){constreplacement=de.replace(\"#{\",\"\").replace(\"}\",\"\");constwe=replacement.replace('.','');den=den.replace(de,`obj['${we}']`);returnreplacement});allDataElements=_.concat(allDataElements,des);}if(numeratorGroups){constgps=numeratorGroups.map(function(oug){constreplacement=oug.replace(\"OU_GROUP{\",\"\").replace(\"}\",\"\");num=num.replace(oug,`filterGroups.${replacement}.indexOf(obj.ou)!==-1`);returnreplacement});allGroups=_.concat(allGroups,gps);}if(denominatorGroups){constgps=denominatorGroups.map(function(oug){constreplacement=oug.replace(\"OU_GROUP{\",\"\").replace(\"}\",\"\");den=den.replace(oug,`filterGroups.${replacement}.indexOf(obj.ou)!==-1`);returnreplacement;});allGroups=_.concat(allGroups,gps);}letfilterGroups={};if(allGroups.length>0){constgroups=awaitfetchOrganisationsByGroups(allGroups.join(','));constprocessedGroups=groups.organisationUnitGroups.map(function(gp){constunits=gp.organisationUnits.map(function(o){returno.id;});return[gp.id,units];});filterGroups=_.fromPairs(processedGroups);}if(rule.level){orgs=`${orgs};${rule.level}`;}constdata=awaitfetchAnalyticsData(allDataElements.join(';'),periods,orgs);constwhatToGroup=data.rows.map(function(r){constobj=_.fromPairs([[r[0].replace('.',''),parseFloat(r[3])],['pe',r[1]],['ou',`${data.metaData.ouHierarchy[r[2]]}/${r[2]}`],]);returnobj;});constgrouped=_.groupBy(whatToGroup,function(x){return`${x.pe}${x.ou}`;});constsearches=_.keys(grouped).map(function(x){constval=grouped[x];returnObject.assign.apply(Object,val);});constdenominatorData=searches.filter(function(obj){returneval(den);});constnumeratorData=searches.filter(function(obj){returneval(num);});constpp=dimensions.ou.map(function(o){constprocessedIndicator=dimensions.pe.map(function(p){constouDenominator=denominatorData.filter(function(ou){returnString(ou.ou).indexOf(o)!==-1&&p===ou.pe;});constouNumerator=numeratorData.filter(function(ou){returnString(ou.ou).indexOf(o)!==-1&&p===ou.pe;});letvalue=0;if(ouDenominator.length>0){value=String(Number(ouNumerator.length*100/ouDenominator.length).toFixed(2));}return[indicatorId,p,o,value]});returnprocessedIndicator});dummy.metaData.items[indicatorId]={name:rule.name};dummy.metaData.dimensions.dx=[indicatorId];dummy.rows=_.flatten(pp);dummy.height=_.flatten(pp).length;dummy.width=4;dummy.headers=[{\"name\":\"dx\",\"column\":\"Data\",\"valueType\":\"TEXT\",\"type\":\"java.lang.String\",\"hidden\":false,\"meta\":true},{\"name\":\"pe\",\"column\":\"Period\",\"valueType\":\"TEXT\",\"type\":\"java.lang.String\",\"hidden\":false,\"meta\":true},{\"name\":\"ou\",\"column\":\"Organisationunit\",\"valueType\":\"TEXT\",\"type\":\"java.lang.String\",\"hidden\":false,\"meta\":true},{\"name\":\"value\",\"column\":\"Value\",\"valueType\":\"NUMBER\",\"type\":\"java.lang.Double\",\"hidden\":false,\"meta\":false}];parameters.success(dummy);}catch(e){parameters.error({});}}call(parameters.pe,parameters.ou,parameters.rule);";

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
