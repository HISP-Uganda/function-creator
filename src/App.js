import React, {Component} from 'react';
import {Provider} from "mobx-react";
import * as PropTypes from 'prop-types';
import {store} from './stores/Store'
import HeaderBar from '@dhis2/ui/widgets/HeaderBar';
import Indicators from "./components/Indicators";
import D2UIApp from "@dhis2/d2-ui-app";


class App extends Component {

    getChildContext() {
        return {d2: this.props.d2};
    }

    render() {
        return (
            <Provider store={store}>
                <D2UIApp className="section-headerbar">
                    <HeaderBar appName="Function Updater" baseURL={this.props.baseUrl} />
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
