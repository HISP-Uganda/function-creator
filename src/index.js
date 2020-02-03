import React from 'react';
import ReactDOM from 'react-dom';
import {init as d2Init, config, getManifest, getUserSettings} from 'd2';

import 'material-design-icons/iconfont/material-icons.css';
import App from './App';
import './index.css';

import "antd/dist/antd.css";
import 'react-vis/dist/style.css';

const getBaseUrl = () => {
    let baseUrl;
    let urlArray = window.location.pathname.split('/');
    let apiIndex = urlArray.indexOf('api');
    if (apiIndex > 1) {
        baseUrl = '/' + urlArray[apiIndex - 1] + '/';
    } else {
        baseUrl = '/';
    }

    return window.location.protocol + '//' + window.location.host + baseUrl
};

const init = async () => {

    const isProd = process.env.NODE_ENV === 'production';
    if (!isProd && (!process.env.REACT_APP_DHIS2_BASE_URL || !process.env.REACT_APP_DHIS2_AUTHORIZATION)) {
        throw new Error(
            'Missing env variables REACT_APP_DHIS2_BASE_URL and REACT_APP_DHIS2_AUTHORIZATION'
        );
    }
    // api config
    const baseUrl = isProd ? getBaseUrl() : process.env.REACT_APP_DHIS2_BASE_URL;
    const authorization = process.env.REACT_APP_DHIS2_AUTHORIZATION;

    config.baseUrl = `${baseUrl}/api`;
    config.headers = isProd ? null : {Authorization: authorization};

    getUserSettings()
        .then(() => d2Init(config))
        .then(initializedD2 => {
            ReactDOM.render(
                <App baseUrl={baseUrl} d2={initializedD2}/>, document.getElementById('root')
            );
        });
};

init();
