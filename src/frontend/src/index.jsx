import "core-js/stable";
import "regenerator-runtime/runtime";
import MainApp from './MainApp.jsx';
import React from 'react';
import ReactDOM from 'react-dom';

document.addEventListener('DOMContentLoaded', function () {
    ReactDOM.render(<MainApp />, document.getElementById('root'));
});
