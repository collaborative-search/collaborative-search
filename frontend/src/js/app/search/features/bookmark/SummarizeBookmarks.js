import React from 'react';

import SessionActions from "../../../../actions/SessionActions";
import SessionStore from "../../../../stores/SessionStore";
import BookmarkStore from "./BookmarkStore";
import { Button } from "react-bootstrap";
//import AccountStore from "../../../../stores/AccountStore";



export default class SummarizeBookmarks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bookmarks: [],
            popup: false
        };

        SessionActions.getBookmarksAndExcludes();
    }
    fetchSummary(json) {
        // POST request using fetch with async/await
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: json
        };
        const response = fetch('http://localhost:5000/summary/url', requestOptions);
        const data = response.json();
        console.log(data)
    }

    render() {

        return <div style={{paddingTop:"10px"}}>
            <Button variant="light" className="resetGroupButton"
                style={{ width: "97%" }}
                onClick={this.changeHandler}>
                Summarize Bookmarks</Button>
        </div>
    }

    ////


    changeHandler() {
        let bookmarks = BookmarkStore.getBookmarks();
        // if (!this.props.collaborative) {
        //     bookmarks = bookmarks.filter((data) => {
        //         return data.userId === AccountStore.getUserId();
        //     })
        // }
        bookmarks = bookmarks.map((data) => {
            data.userColor = SessionStore.getMemberColor(data.userId);
            return data;
        });
        let urls = []
        for (let bookmark in bookmarks) {
            if(bookmarks[bookmark].starred){
                console.log("star")
                urls.push(bookmarks[bookmark].url)
            }
            else{
                console.log("no star")
            }
        }
        //console.log(urls)
        if (urls.length > 3) {
            alert('Choose Upto 3 documents')
        }
        else if(urls.length === 0 ){
            alert('Star the documents in bookmarks to be summarized')
        }
        else {
            let json = JSON.stringify({ urls: urls })
            console.log(json)
            //this.fetchSummary(json)
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer my-token',
                    'My-Custom-Header': 'foobar'
                },
                body: json
            };
            fetch('http://localhost:5000/summary/url', requestOptions)
                .then(response => response.json())
                .then(data => {
                    console.log("got response")

                    console.log(data)
                    window.open(`http://127.0.0.1:5000/summary/show?business=${encodeURIComponent(data.business)}&tech=${encodeURIComponent(data.tech)}&politics=${encodeURIComponent(data.politics)}&sports=${encodeURIComponent(data.sports)}&entertainment=${encodeURIComponent(data.entertainment)}`)
                });
            alert('Summary generation in procees. Once ready It will automatically be opened in new window')
        }

    }


    popupHandler() {
        this.setState({
            popup: !this.state.popup
        });
    }
}