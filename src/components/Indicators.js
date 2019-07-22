import React from 'react';
import {observer, inject} from 'mobx-react'
import {Spin, Button, Input, Icon, Menu, Dropdown} from 'antd'
import {Delete} from "@material-ui/icons";

import Indicator from "./Indicator";
import FTable from "./FTable";
import * as PropTypes from "prop-types";
import App from "../App";

@inject('store')
@observer
class Indicators extends React.Component {
    store = null;

    constructor(props) {
        super(props);
        const {d2, store} = props;
        store.setD2(d2);
        this.store = store;
    }


    componentDidMount() {
        this.store.loadIndicators();
        this.store.loadDataElements();
        this.store.loadOUGroups();
        this.store.loadOULevels();
        this.store.loadDataSets();
        this.store.fetchRoot();
    }


    cols = ['name', 'description'];
    menu = {};

    render() {
        const icons = {
            delete: <Delete/>
        };
        return <Spin tip="Loading..." spinning={this.store.spinning} size="large">
            {this.store.showing ? <div style={{padding: 5}}>
                <Input value={this.store.search['indicators']} size="large" placeholder="Search ..."
                       onChange={this.store.searchChange('indicators')} style={{marginBottom: 10}}/>
                <FTable
                    columns={this.cols}
                    rows={this.store.searchedIndicators}
                    contextMenu={this.store.tableActions}
                    primaryAction={this.store.setCurrentIndicator}
                    icons={icons}
                />
                <div>
                    <Button htmlType="button" size="large" type="primary"
                            onClick={this.store.showIndicator}>Add</Button>
                </div>

            </div> : <Indicator d2={this.props.d2}/>}
        </Spin>
    }

}

Indicators.propTypes = {
    d2: PropTypes.object.isRequired

};

export default Indicators
