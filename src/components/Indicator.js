import React from 'react';
import {inject, observer} from "mobx-react";
import {
    Button,
    Input,
    Spin,
    Form,
    Row,
    Col,
    Select,
    Checkbox
} from 'antd';


import OuTreeDialog from "./dialogs/OuTreeDialog";
import PeriodDialog from "./dialogs/PeriodDialog";
import FTable from "./FTable";
import * as PropTypes from "prop-types";
import IndicatorTable from "./IndicatorTable";
import AddConditionDialog from "./dialogs/AddConditionDialog";
import JoinTwoConditionDialog from "./dialogs/JoinTwoConditionDialog";
import TablePagination from "@material-ui/core/TablePagination";

const {TextArea} = Input;

const {Option} = Select;


@inject('store')
@observer
class Indicator extends React.Component {
    store = null;
    columns = [{
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    }];

    dataElementColumns = [{
        title: 'Code',
        dataIndex: 'code',
        key: 'code',
    }, ...this.columns];

    organisationColumns = [...this.columns, {
        title: 'Level',
        dataIndex: 'level',
        key: 'level',
    }];

    constructor(props) {
        super(props);
        const {d2, store} = props;
        store.setD2(d2);
        this.store = store;
    }

    render() {
        return (
            <Spin tip="Loading..." spinning={this.store.spinning} size="large">
                <div style={{marginLeft: 5, marginRight: 5, paddingTop: 5}}>
                    <Form>
                        <Row>
                            <Col span={12} style={{paddingRight: 5}}>
                                <Form.Item label="Indicator Name">
                                    <Input placeholder="Indicator name" value={this.store.indicator.name}
                                           onChange={this.store.indicator.valueChangeName} size="large"/>
                                </Form.Item>

                                <Form.Item label="Indicator Description">
                                <TextArea
                                    rows={6}
                                    style={{fontSize: '16px'}}
                                    value={this.store.indicator.description}
                                    onChange={this.store.indicator.valueChangeDescription}
                                />
                                </Form.Item>

                                <Form.Item label="Numerator condition">
                                    <div>
                                        <Select style={{width: '100%'}}
                                                onChange={this.store.indicator.rule.json.setNumerator}
                                                size="large" value={this.store.indicator.rule.json.numerator}>
                                            {this.store.indicator.rule.json.conditions.map(condition =>
                                                <Option key={condition.id}
                                                        value={condition.name}>{condition.name}</Option>)}
                                        </Select><Checkbox checked={this.store.indicator.rule.numIsOuCount}
                                                           onChange={this.store.indicator.rule.onChangeNum}>Count
                                        organisations</Checkbox>
                                    </div>
                                </Form.Item>

                                <Form.Item label="Denominator condition">
                                    <div>
                                        <Select style={{width: '100%'}}
                                                onChange={this.store.indicator.rule.json.setDenominator}
                                                size="large" value={this.store.indicator.rule.json.denominator}>
                                            <Option value="1">1</Option>
                                            {this.store.indicator.rule.json.conditions.map(condition =>
                                                <Option key={condition.id}
                                                        value={condition.name}>{condition.name}</Option>)}
                                        </Select>{this.store.indicator.rule.json.denominator !== '1' ?
                                        <Checkbox checked={this.store.indicator.rule.denIsOuCount}
                                                  onChange={this.store.indicator.rule.onChangeDen}>Count
                                            organisations</Checkbox> : null}
                                    </div>
                                </Form.Item>


                            </Col>
                            <Col span={12} style={{paddingLeft: 5}}>
                                <FTable rows={this.store.indicator.rule.json.pagedConditions} columns={['name']}
                                        contextMenu={this.store.conditionActions} icons={{}}
                                        primaryAction={this.store.indicator.setCurrentCondition}/>

                                <TablePagination
                                    component="div"
                                    count={this.store.indicator.rule.json.conditions.length}
                                    rowsPerPage={this.store.indicator.rule.json.paging['conditions']['rowsPerPage']}
                                    page={this.store.indicator.rule.json.paging['conditions']['page']}
                                    backIconButtonProps={{
                                        'aria-label': 'Previous Page',
                                    }}
                                    nextIconButtonProps={{
                                        'aria-label': 'Next Page',
                                    }}
                                    onChangePage={this.store.indicator.rule.json.handleChangeElementPage('conditions')}
                                    onChangeRowsPerPage={this.store.indicator.rule.json.handleChangeElementRowsPerPage('conditions')}
                                />
                                <div style={{display: 'flex'}}>
                                    <AddConditionDialog/>
                                    <JoinTwoConditionDialog/>
                                </div>

                                <div style={{display: 'flex', marginTop: 30}}>
                                    <PeriodDialog d2={this.props.d2}/>
                                    <OuTreeDialog d2={this.props.d2}/>
                                    <Button size="large" htmlType="button" type="primary"
                                            onClick={this.store.call}
                                            style={{marginLeft: 'auto'}}
                                            disabled={this.store.disableSubmit}>View</Button>
                                </div>

                                <div style={{
                                    minHeight: '33vh',
                                    overflow: 'auto',
                                    marginTop: 20,
                                    marginBottom: 20,
                                    maxHeight: '50vh'
                                }}>
                                    <IndicatorTable d2={this.props.d2}/>
                                </div>

                            </Col>
                        </Row>
                        <Form.Item>
                            <Button size="large" htmlType="button" type="primary"
                                    onClick={this.store.addIndicator}
                                    style={{marginRight: 5}}
                                    disabled={this.store.disableSubmit}>Save Indicator</Button>
                            <Button size="large" htmlType="button" type="primary"
                                    onClick={this.store.cancel}>Cancel</Button>
                        </Form.Item>
                    </Form>
                </div>
            </Spin>
        )
    }
}

Indicator.propTypes = {
    d2: PropTypes.object.isRequired

};

export default Indicator;
