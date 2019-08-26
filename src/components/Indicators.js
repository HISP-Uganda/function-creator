import React from 'react';
import {observer, inject} from 'mobx-react'
import {Spin, Button, Input} from 'antd'
import {Delete} from "@material-ui/icons";

import Indicator from "./Indicator";
import FTable from "./FTable";
import * as PropTypes from "prop-types";
import '../sticky.css'
import TablePagination from "@material-ui/core/TablePagination";

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
        this.store.loadSystemIndicators();
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
                <div className="scrollable">
                    <FTable
                        columns={this.cols}
                        rows={this.store.pagedIndicators}
                        contextMenu={this.store.tableActions}
                        primaryAction={this.store.setCurrentIndicator}
                        icons={icons}
                    />

                    <TablePagination
                        component="div"
                        count={this.store.searchedIndicators.length}
                        rowsPerPage={this.store.paging['indicators']['rowsPerPage']}
                        page={this.store.paging['indicators']['page']}
                        backIconButtonProps={{
                            'aria-label': 'Previous Page',
                        }}
                        nextIconButtonProps={{
                            'aria-label': 'Next Page',
                        }}
                        onChangePage={this.store.handleChangeElementPage('indicators')}
                        onChangeRowsPerPage={this.store.handleChangeElementRowsPerPage('indicators')}
                    />
                </div>
                <div>
                    <Button htmlType="button" size="large" type="primary"
                            onClick={this.store.showIndicator}>Add Indicator</Button>
                </div>

            </div> : <Indicator d2={this.props.d2}/>}
        </Spin>
    }

}

Indicators.propTypes = {
    d2: PropTypes.object.isRequired

};

export default Indicators
