import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

class Example extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {}
    }

    render() {
        return (
            <div>hi</div>
        )
    }
}

if(module.hot) {
    ReactDOM.render((
        <AppContainer>
            <Example />
        </AppContainer>
    ), document.getElementById('app'));

    module.hot.accept();
}
