class Game extends React.Component {

    constructor(props) {
        super(props);

        // handle stream game events
        var gameFeed = new EventSource("/gamefeed/" + room);

        gameFeed.addEventListener("message", function(msg){

            let m = JSON.parse(msg.data);
            this.parseEvent(m);

        }.bind(this));

        this.state = {
            inGame: false
        };
    }

    parseEvent(m) {
        if (m.type === "start") {
            this.setState({
                inGame: true,
                letter: m.letter
            });
        } else if (m.type === "allready") {
            // get current component state
            var currentState = this.state;

            // set allready state to true
            currentState.allReady = true;
            currentState.members = m.members;
            console.log(m.members);
            this.setState({
                currentState
            });

        } else if (m.type === "userready" && m.user === user) {

            var answerInputs = [];
            var obj = {};

            $("#answers :input").each(function() {
                if ($(this).attr("type") === "text"){
                    var id = $(this).attr("id");
                    obj[id] = $(this).val().toString();
                    answerInputs.push(obj);
                }
            });

            console.log(answerInputs.length);
            answerInputs.forEach(function(x){console.log(x)})

            this.setState({
                inGame: true,
                letter: this.state.letter,
                ready: true,
                allReady: false,
                answers: obj
            });
        } else if (m.type === "evalstate") {
            // get current component state
            var currentState = this.state;

            // append evalstate to component state
            currentState.evalstate = m.state;
            this.setState({
                currentState
            });
            console.log(this.state.evalstate);

            // update interface
            this.updateEvalInterface();
        }
    }

    updateEvalInterface() {
        for (var member in this.state.evalstate.members) {
            if (this.state.evalstate.members.hasOwnProperty(member)) {
                if (this.state.evalstate.members[member].name === user) {
                    for (var cat in this.state.evalstate.members[member].answers) {
                        console.log(user + " ~ " + cat + ": " + this.state.evalstate.members[member].answers[cat]);

                        // update the answer checkboxes
                        $('#' + cat).prop('checked', this.state.evalstate.members[member].answers[cat]);
                    }
                }
            }
        }
    }

    lockRoom() {
        $.ajax({
            url: "/lockroom",
            data: JSON.stringify( { "room": room } ),
            method: "post",
            contentType: "application/json",
            success: function (msg) {
                console.log(msg);
            }
        });
    }

    userReady() {
        $.ajax({
            url: "/userready",
            data: JSON.stringify( {
                "room": room,
                "user": user
            } ),
            method: "post",
            contentType: "application/json",
            success: function (msg) {
                console.log(msg);
            }
        });
    }

    // handles modification of a user's score
    modifyScore(check) {
        if($("#" + check).is(":checked")){
            console.log(check);
        } else {
            console.log("poo");
        }

        $.ajax({
            url: "/toggleanswer",
            data: JSON.stringify( {
                "room": room,
                "user": user,
                "category": check
            } ),
            method: "post",
            contentType: "application/json",
            success: function (msg) {
                console.log(msg);
            }
        });
    }

    render() {
        if (!this.state.inGame) {
            return (
                <div>
                    <p>Wait for all players to join, then click button to begin...</p>
                    <button onClick={this.lockRoom.bind(this)}>Start Game</button>
                </div>
            );
        } else if (this.state.ready !== true) {
            return (
                <div id="answers">
                    <p>The current letter is... {this.state.letter}</p>
                    <br/>
                    <div className="input-group">
                        <span className="input-group-addon" id="basic-addon1">Fictional Character</span>
                        <input id="character" type="text" className="form-control" placeholder="Enter here..." aria-describedby="basic-addon1" />
                    </div>
                    <div className="input-group">
                        <span className="input-group-addon" id="basic-addon2">Location</span>
                        <input id="location" type="text" className="form-control" placeholder="Enter here..." aria-describedby="basic-addon2" />
                    </div>
                    <div className="input-group">
                        <span className="input-group-addon" id="basic-addon3">Animal</span>
                        <input id="animal" type="text" className="form-control" placeholder="Enter here..." aria-describedby="basic-addon3" />
                    </div>

                    <button id="button" onClick={this.userReady.bind(this)}>I'm ready!</button>
                </div>
            );
        } else if (this.state.ready && !this.state.allReady) {
            return (
                <div id="answers">
                    <p>Waiting for other players to finish...</p>
                </div>
            );
        } else if (this.state.allReady) {

            // construct list of inputs for all answers
            var answersHtml = [];
            // for (var property in this.state.answers) {
            //     if (this.state.answers.hasOwnProperty(property)) {
            //         answersHtml.push(
            //             <div className="results-input-group" key={property}>
            //                 <span className="input-group-addon">
            //                         {property}: {this.state.answers[property]}
            //                 </span>
            //                 <span className="input-group-addon">
            //                     <input type="checkbox" aria-label="..." id={property} onClick={this.modifyScore.bind(this, property)} />
            //                 </span>
            //                 <br/>
            //             </div>
            //         );
            //     }
            // }

            // testing bullshit
            for (var member in this.state.members) {
                if (this.state.members.hasOwnProperty(member)) {
                    for (var property in this.state.answers) {
                        if (this.state.answers.hasOwnProperty(property)) {
                            answersHtml.push(
                                <div className="panel panel-default">
                                    <div className="panel-heading">{member}</div>
                                    <div className="panel-body">
                                        <div className="results-input-group" key={property + "-" + member}>
                                            <span className="input-group-addon">
                                                {property}: {this.state.answers[property]}
                                            </span>
                                            <span className="input-group-addon">
                                                <input type="checkbox" aria-label="..." id={property}
                                                       onClick={this.modifyScore.bind(this, property)}/>
                                            </span>
                                            <br/>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    }
                }
            }

            // update interface
            return (
                <div>
                    <p>Current Letter: {this.state.letter}</p>
                    <br/>

                    <div className="row">
                        <div className="col-xs-3 col-md-2">
                        </div>
                        <div className="col-xs-5 col-md-3">
                            {answersHtml}
                        </div>
                    </div>
                </div>
            )
        }
    }
}

React.render(
    <Game />,
    document.getElementById('content')
);