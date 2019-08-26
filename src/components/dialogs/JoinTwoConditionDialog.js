import {Button, Input, Modal, Select, Form} from "antd";
import React from "react";
import {inject, observer} from "mobx-react";

const {Option} = Select;

@inject('store')
@observer
class JoinTwoConditionDialog extends React.Component {

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
            <div>
                <div style={{paddingLeft: 10}}>
                    <Button size="large" htmlType="button" type="primary"
                            onClick={this.store.indicator.openDialog}
                            disabled={this.store.indicator.rule.json.conditions.length < 2}>Join Two
                        Conditions</Button>
                </div>
                <Modal
                    title="Join Two Conditions"
                    visible={this.store.indicator.dialogOpen}
                    centered={true}
                    onOk={this.store.indicator.okCondition}
                    onCancel={this.store.indicator.closeDialog}
                    width="70%"
                    maskClosable={false}
                    okButtonProps={{size: 'large'}}
                    cancelButtonProps={{size: 'large'}}
                    align={null}
                >
                    <Form.Item label="Name">
                        <Input placeholder="Condition name" value={this.store.indicator.condition.name}
                               onChange={this.store.indicator.condition.valueChangeName} size="large"/>
                    </Form.Item>
                    <Form.Item label="Condition 1">
                        <Select style={{width: '100%'}} onChange={this.store.indicator.condition.setCondition1}
                                size="large" value={this.store.indicator.condition.condition1}>
                            {this.store.indicator.rule.json.conditions.map(condition =>
                                <Option key={condition.id}
                                        value={condition.name}>{condition.name}</Option>)}
                        </Select>
                    </Form.Item>

                    {this.store.indicator.condition.condition1 !== '' ? <Form.Item label="Sign 1">
                        <Select style={{width: '100%'}} onChange={this.store.indicator.condition.setComparator}
                                size="large" value={this.store.indicator.condition.comparator}>
                            <Option value="+">+</Option>
                            <Option value="-">-</Option>
                            <Option value="/">/</Option>
                            <Option value="*">x</Option>
                            <Option value="&&">AND</Option>
                            <Option value="||">OR</Option>
                            <Option value="!">NOT</Option>
                        </Select>
                    </Form.Item> : null}

                    {this.store.indicator.condition.comparator !== '' && this.store.indicator.condition.comparator !== 'None' ?
                        <Form.Item label="Condition 2">
                            <Select style={{width: '100%'}}
                                    onChange={this.store.indicator.condition.setCondition2}
                                    size="large" value={this.store.indicator.condition.condition2}>
                                {this.store.possible.map(condition =>
                                    <Option key={condition.id}
                                            value={condition.name}>{condition.name}</Option>)}
                            </Select>
                        </Form.Item> : null}

                    {this.store.indicator.condition.condition2 !== '' && !this.store.hideSignAndValueField ?
                        <Form.Item label="Sign 2">
                            <Select style={{width: '100%'}}
                                    onChange={this.store.indicator.condition.setComparator1}
                                    size="large"
                                    value={this.store.indicator.condition.comparator1}
                            >
                                <Option value="<">&lt;</Option>
                                <Option value="<=">&le;</Option>
                                <Option value=">">&gt;</Option>
                                <Option value=">=">&ge;</Option>
                                <Option value="==">==</Option>
                                <Option value="IN"
                                        disabled={this.store.indicator.condition.type === 'dataElement'}>IN</Option>
                            </Select>
                        </Form.Item> : null}

                    {this.store.indicator.condition.comparator1 !== '' && !this.store.hideSignAndValueField ?
                        <Form.Item label="Value">
                            <Input size="large"
                                   value={this.store.indicator.condition.value}
                                   onChange={this.store.indicator.condition.valueChangeDescription}/>
                        </Form.Item> : null}
                </Modal>
            </div>
        );
    }
}

export default JoinTwoConditionDialog;
