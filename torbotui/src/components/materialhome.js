import React from 'react';
import ReactDOM from 'react-dom';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import MaterialInfo from './materialinfo.js';
import './materialhome.css';

const StyledTextField = withStyles({
    root: {
        'background-color': 'white',
        'margin-bottom': 5,
        'padding': 5,
        'border-radius': 6
    }
})(TextField);

const StyledSelect = withStyles({
    root: {
        'background-color': 'white',
        'margin-bottom': 5, 
        'padding': 5,
        'border-radius': 6
    }
})(Select);

const LINKS = 'GET_LINKS';
const INFO = 'GET_INFORMATION';

function makeRequest(method, url, data) {
    return new Promise(function (resolve, reject) {
            const xhr = new XMLHttpRequest();
            xhr.open(method, url);
            xhr.onload = function() {
                if (this.status >= 200 && this.status < 300) {
                    resolve({
                        response: xhr.response
                    });
                } else {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function() {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            xhr.send(JSON.stringify(data));
        });
}

class MaterialHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {option: LINKS, url: '', info: null, submit: false};
        this.handleTextChange = this.handleTextChange.bind(this);
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.keyPress = this.keyPress.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();
        const ws = new WebSocket('ws://127.0.0.1:8080/test/ws');
        const msg = {
            type: LINKS,
            url: this.state.url
        };
        switch (this.state.option) {
            case LINKS:
                ws.send(JSON.stringify(msg));
                ws.onmessage = function() {
                    debugger;
                };
                /*
                makeRequest('POST', 'http://127.0.0.1:3000/links', this.state)
                    .then(responseObj => {
                        console.log(responseObj);
                    })
                    .catch(err => {
                        console.log(err);
                    });
                    */
                    break;
            case INFO:
                makeRequest('POST', 'http://127.0.0.1:3000/info', this.state)
                    .then(responseObj => {
                        const text = JSON.parse(responseObj.response);
                        this.setState({'info': text});
                        this.setState({'submit': true});
                    })
                    .catch(err => {
                        console.log(err);
                    });
                    break;
        }
    }
    
    handleTextChange(event) {
        this.setState({url: event.target.value});
    }

    handleSelectChange(event) {
        this.setState({option: event.target.value});
    }

    keyPress(event) {
        if (event.key === 'Enter') {
            this.handleSubmit(event);
        }
    }

    render() {
        if (!this.state.submit) {
            return (
                <form>
                    <StyledTextField label="URL" onKeyDown={this.keyPress} onChange={this.handleTextChange} fullWidth={true}/>
                    <br/>
                    <StyledSelect value={this.state.option} onChange={this.handleSelectChange}>
                        <MenuItem value={LINKS}>Get Links</MenuItem>
                        <MenuItem value={INFO}>Get Information</MenuItem>
                    </StyledSelect>
                    <br/>
                    <Button onClick={this.handleSubmit} variant="contained" color="primary">
                        Submit
                    </Button>
                </form>
            );
        }
        switch (this.state.option) {
            case INFO:
                return <MaterialInfo info={this.state.info}/>
            default:
                console.log("Invalid option.");
        }
    }
}

export default MaterialHome;
