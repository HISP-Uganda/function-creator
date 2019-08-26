import React, {Component} from 'react';
import {Provider} from "mobx-react";
import * as PropTypes from 'prop-types';
import {store} from './stores/Store'
import Indicators from "./components/Indicators";
import D2UIApp from "@dhis2/d2-ui-app";
import HeaderBar from '@dhis2/d2-ui-header-bar';


class App extends Component {

    constructor(props) {
        super(props);
        const {d2} = props;
        d2.i18n.translations['id'] = 'Id';
        d2.i18n.translations['program_name'] = 'Program Name';
        d2.i18n.translations['program_type'] = 'Program Type';
        d2.i18n.translations['last_updated'] = 'Last Updated';
        d2.i18n.translations['last_run'] = 'Last Run';
        d2.i18n.translations['run'] = 'Run';
        d2.i18n.translations['schedule'] = 'Schedule';
        d2.i18n.translations['logs'] = 'Logs';
        d2.i18n.translations['delete'] = 'Delete';
        d2.i18n.translations['actions'] = 'Actions';
        d2.i18n.translations['display_name'] = 'Program Name';
        d2.i18n.translations['mapping_id'] = 'Mapping Id';
        d2.i18n.translations['name'] = 'Name';
        d2.i18n.translations['app_search_placeholder'] = 'Search Apps';
        d2.i18n.translations['manage_my_apps'] = 'Manage My Apps';
        d2.i18n.translations['settings'] = 'Settings';
        d2.i18n.translations['account'] = 'Account';
        d2.i18n.translations['profile'] = 'Profile';
        d2.i18n.translations['log_out'] = 'Logout';
        d2.i18n.translations['help'] = 'Help';
        d2.i18n.translations['about_dhis2'] = 'About DHIS2';
        d2.i18n.translations['aggregate_id'] = 'Id';
        d2.i18n.translations['upload'] = 'Upload';
        d2.i18n.translations['code'] = 'Code';
        d2.i18n.translations['download'] = 'Import from API';
        d2.i18n.translations['template'] = 'Download Mapping';
        d2.i18n.translations['year'] = 'Year';
        d2.i18n.translations['sixMonth'] = 'Six Month';
        d2.i18n.translations['jan-jun'] = 'Jan - Jun';
        d2.i18n.translations['jul-dec'] = 'Jul - Dec';
        d2.i18n.translations['edit'] = 'Edit';

        d2.i18n.translations['assign_all'] = 'Assign all';
        d2.i18n.translations['hidden_by_filters'] = 'Hidden by filters';
        d2.i18n.translations['day'] = 'Day';

        d2.i18n.translations['year'] = 'Year';
        d2.i18n.translations['week'] = 'Week';
        d2.i18n.translations['day'] = 'Day';
        d2.i18n.translations['month'] = 'Month';
        d2.i18n.translations['quarter'] = 'Quarter';
        d2.i18n.translations['jan'] = 'January';
        d2.i18n.translations['feb'] = 'February';
        d2.i18n.translations['mar'] = 'March';
        d2.i18n.translations['apr'] = 'April';
        d2.i18n.translations['may'] = 'May';
        d2.i18n.translations['jun'] = 'June';
        d2.i18n.translations['jul'] = 'July';
        d2.i18n.translations['aug'] = 'August';
        d2.i18n.translations['sep'] = 'September';
        d2.i18n.translations['oct'] = 'October';
        d2.i18n.translations['nov'] = 'November';
        d2.i18n.translations['dec'] = 'December';
        d2.i18n.translations['Q1'] = 'Q1';
        d2.i18n.translations['Q2'] = 'Q2';
        d2.i18n.translations['Q3'] = 'Q3';
        d2.i18n.translations['Q4'] = 'Q4';
        d2.i18n.translations['mapping_name'] = 'Mapping Name';
        d2.i18n.translations['mapping_description'] = 'Mapping Description';
        d2.i18n.translations['last'] = 'Last Run';
        d2.i18n.translations['next'] = 'Next Run';
        d2.i18n.translations['created'] = 'Created';
        d2.i18n.translations['description'] = 'Description';
    }

    getChildContext() {
        return {d2: this.props.d2};
    }

    render() {
        return (
            <Provider store={store}>
                <D2UIApp className="section-headerbar">
                    <HeaderBar d2={this.props.d2}/>
                    <div style={{height: 48}}/>
                    <Indicators d2={this.props.d2}/>
                </D2UIApp>
            </Provider>
        );
    }
}

App.childContextTypes = {
    d2: PropTypes.object,
};

App.propTypes = {
    d2: PropTypes.object.isRequired

};


export default App;
