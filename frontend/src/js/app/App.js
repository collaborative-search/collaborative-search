import React from 'react'
import { Redirect, Route, Router } from 'react-router-dom'
//import MobileDetect from 'mobile-detect';
//import Bowser from "bowser"
import history from './History';

//import About from './pages/About';
import Search from './search/Search';

import Chat from './search/features/chat/Chat';
export class App extends React.Component {

    render() {
        // const md = new MobileDetect(window.navigator.userAgent);
        // if (md.mobile() !== null) {
        //     return (<div/>)
        // }
        //const browser = Bowser.getParser(window.navigator.userAgent);
        // const isValidBrowser = browser.satisfies({
        // // or in general
        // chrome: ">=47",
        // firefox: ">=50"
        // });

        // if(!isValidBrowser && isValidBrowser){
        //     return (<div>
        //         <h3>Your browser does not meet our requriement:
        //             Google Chrome version 47 (or higher) and Mozilla Firefox version 50 (or higher).
        //             Please upgrade your browser to take part in our study</h3>
        //     </div>)
        // } 

        // let invalid = localStorage.getItem("invalid-user") || 0;
        // if(invalid === 1 ){
        //     return (<div>
        //         <h3>You have been disqualified from the study.</h3>
        //     </div>)
        // }



        return (
            <Router history={history}>
                <div>
                    <Route exact path="/" render={() =>
                    (
                        <Redirect to="/search" />
                    )
                    } />
                    <Route path="/search" component={Search} />
                    <Route path="/chat" component={Chat} />
                </div>
            </Router>
        );
    }
}

export default App