import './Viewer.pcss';
import React from 'react';
import Iframe from 'react-iframe'
import AccountStore from "../../../../../stores/AccountStore"
import AnnotationContainer from "../../../features/annotation/AnnotationContainer";
import Modal from "../../../../common/Modal";
import config from '../../../../../config';





export default class Viewer extends React.Component {

    // constructor(props){
    //     super(props)

    //    this.state = {
    //        isLoading: true
    //    }
    // }


    handleScroll() {
        console.log("iframe scrolling")

        //console.log(checkScrollSpeed());
    }


    render() {
        if (this.props.url === "") {
            return <div />
        }


        let lastSecond = [];
        let scrollList = []
        let oldPos = 0
        let newPos = 0
        let mouseWheelEvent = (e) => {
            //console.log("EVENT",e.deltaY)
            newPos = e.target.scrollTop
            let deltaY = Math.abs(newPos - oldPos)
            oldPos = newPos

            lastSecond.push({ delta: Math.floor(deltaY), timestamp: new Date().getTime() });
            //console.log(e.target.scrollTop)
            //lastSecond.push({ delta: Math.floor(Math.abs(e.deltaY)), timestamp: new Date().getTime() });
            //console.log(lastSecond)
        }
        setInterval(() => {
            var pixelsPerSecond = displayLastSecond();
            //displayLastSecond();
            //console.log(pixelsPerSecond)

            if (pixelsPerSecond > 0) {
                scrollList.push(pixelsPerSecond)
            }

        }, 50);

        let displayLastSecond = () => {
            var now = new Date().getTime();
            var total = 0;
            var timestamps = 0;
            // if(lastSecond.length > 1){
            //     console.log("START")
            //     for (let i=0;i<lastSecond.length;i++){
            //         console.log(lastSecond[i].delta)
            //     }
            //     console.log("END")
            // }
            for (var x = 0; x < lastSecond.length; x++) {
                if (now - lastSecond[x].timestamp <= 1000) {
                    total += lastSecond[x].delta;
                    timestamps++;
                } else {
                    lastSecond.splice(x, 1);
                    x--;
                }
            }
            if (timestamps === 0) {
                return 0;
            }
            return Math.round(total);
        }

        let olDtime = ""
        let isFirst = true

        let hoverEnterDocument = () => {
            
        };
        let hoverLeaveDocument = () => {
            
        };
        let fetchResult = () => {
            for (var i = 0; i < this.props.results.length; i++) {
                if (this.props.results[i].url === this.props.url) {
                    return this.props.results[i]
                }
            }
        }

        let closeDocument = () => {
            //load = true
            //this.setState({isLoading:true})
            console.log("doc closed")
            let newTime = new Date().getTime()
            let url = this.props.url
            console.log(url)

            let avgScrollSpeed = 0
            for (var i = 0; i < scrollList.length; i++) {
                avgScrollSpeed += scrollList[i]
            }
            avgScrollSpeed /= scrollList.length
            let json = JSON.stringify({ url: this.props.url })
            //console.log(json)
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
            let result = fetchResult()
            let query = this.props.searchState.query
            fetch('http://localhost:4443/v1/clickthrough/getdata', requestOptions)
                .then(response => response.json())
                .then(data => {
                    console.log("CLICKTHROUGH_RATE", data.clicks / data.total)
                    console.log("TIME_SPENT", olDtime, newTime, newTime - olDtime)
                    console.log("AVG_SCROLL", avgScrollSpeed)

                    if (isNaN(avgScrollSpeed)) {
                        avgScrollSpeed = 0
                    }

                    console.log(query)
                    console.log(result)
                    console.log(AccountStore.getGroupId())

                    const reqOptions = {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer my-token',
                            'My-Custom-Header': 'foobar'
                        },
                        body: JSON.stringify({
                            data: {
                                url: url,
                                timespent: newTime - olDtime,
                                avgscroll: avgScrollSpeed,
                                clickthrough: data.clicks / data.total
                            }
                        })

                    };

                    fetch('http://localhost:5050/userinterest', reqOptions)
                        .then(response => response.json())
                        .then(resp_data => {
                            console.log(resp_data.interest)
                            //TO PQ
                            let interestScale = {
                                'notinterested': 1,
                                'weaklyinterested': 2,
                                'mediuminterested': 3,
                                'stronglyinterested': 4,
                            }
                            const pqRequest = {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer my-token',
                                    'My-Custom-Header': 'foobar'
                                },
                                body: JSON.stringify({
                                    sessionId: AccountStore.getGroupId(),
                                    query: query,
                                    result: result,
                                    interest: interestScale[resp_data.interest]
                                })

                            };
                            fetch('http://localhost:4443/v1/priorityqueue', pqRequest)
                                .then(respon => respon.json())
                                .then(resp => resp)
                        })
                });

            // To desicion tree
            this.props.documentCloseHandler();
        };
        let loadDocument = () => {

            if (isFirst) {

                isFirst = false
                console.log("doc loading")
                olDtime = new Date().getTime()

                let json = JSON.stringify({ url: this.props.url })
                //console.log(json)
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
                fetch('http://localhost:4443/v1/clickthrough/update', requestOptions)
                    .then(response => response.json())
                    .then(data => {
                        console.log(data)
                    });
            }


            //log(LoggerEventTypes.DOCUMENT_LOAD, metaInfo);
            if (!this.props.doctext) {
                // document.getElementById("viewer-content-loader").style.display = "none";
            }
        };
        // let openInBrowser = () => {
        //     console.log("opened in browser")
        //     log(LoggerEventTypes.DOCUMENT_OPEN_BROWSER, metaInfo);
        //     window.open(this.props.url);
        // };
        let generateSummary = () => {
            console.log("summary generation")
            //log(LoggerEventTypes.DOCUMENT_OPEN_BROWSER, metaInfo);
            window.open(`http://localhost:5000/summary?url=${this.props.url}`);
        };


        // let scrollDocument = () => {
        //     //console.log("scrolling")
        //     log(LoggerEventTypes.DOCUMENT_SCROLL, metaInfo);
        // };


        return (
            <Modal width="98%" height="98%">
                <div id="list" className="viewer" onMouseEnter={hoverEnterDocument} onMouseLeave={hoverLeaveDocument}
                //onScroll={scrollDocument}
                >
                    <div className="header">


                        <div className="pull-right">
                            {!this.props.doctext && [
                                <span className="forward" onClick={generateSummary}>Summarize</span>,
                                <span className="divider" />
                            ]}
                            {/* {!this.props.doctext && [
                                <span className="forward" onClick={openInBrowser}>open in browser</span>,
                                <span className="divider" />
                            ]} */}
                            {/* {config.interface.ratings && [
                                <RatingContainer url={this.props.url} />,
                                <span className="divider" />
                            ]} */}
                            <span className="close" onClick={closeDocument}><i className="fa fa-times" /></span>
                        </div>
                    </div>

                    <div className="body"
                        id="myBody"
                        //style={{overflow: "hidden", height: "600px"}}
                        style={{ top: 0, left: 0, position: "relative", overflow: "scroll" }}
                        //onScroll={this.handleScroll}
                        onScroll={(e) => { mouseWheelEvent(e) }}
                    //onWheel={(e) => { mouseWheelEvent(e) }}
                    //onWheel={(e)=>{console.log("ONWHEEL",e)}}
                    >
                        {config.interface.annotations && (
                            <div className="sidebar">
                                <AnnotationContainer url={this.props.url} />
                            </div>
                        )}
                        {/* <div style={{ alignSelf:"center",paddingLeft:"700px"}}>
                             <Loader/>
                        </div>  */}
                        <div style={{ top: 0, left: 0, position: "relative", zIndex: 5, width: "100%", height: "10000px", overflow: "visible " }}>
                            <Iframe crossorigin url={this.props.url}
                                onLoad={loadDocument}
                                scrolling="no"
                                width="100%"
                                height="100%"
                                id="myId"
                                className="myClassname"
                                display="initial"
                                position="relative" />
                        </div>

                        {/* <ViewerPage url={this.props.url} loadHandler={loadDocument} doctext={this.props.doctext} /> */}
                    </div>
                </div>
            </Modal>
        );


    }

}
