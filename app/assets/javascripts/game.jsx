class Game extends React.Component {

    constructor(props) {
        super(props);

        // establish SSE source
        var gameFeed = new EventSource("/gamefeed/" + room);

        // handle stream game events
        gameFeed.addEventListener("message", function(msg){
            let m = JSON.parse(msg.data);
            this.parseEvent(m);
        }.bind(this));

        // initial state setting
        this.state = {
            inGame: false
        };
    }

    // handle incoming SSEs
    parseEvent(m) {
        if (m.type === "start") {
            this.setState({
                inGame: true,
                letter: m.letter,
                scores: m.scores
            });
        } else if (m.type === "allready") {
            // get current component state
            var currentState = this.state;

            // set allready state to true
            currentState.allReady = true;
            currentState.members = m.members;
            currentState.playerAnswers = m.playerAnswers;

            this.setState({
                currentState
            });

        } else if (m.type === "userready" && m.user === user) {

            var obj = {};

            $("#answers :input").each(function() {
                if ($(this).attr("type") === "text"){
                    var id = $(this).attr("id");
                    obj[id] = $(this).val().toString();
                }
            });

            this.setState({
                inGame: true,
                letter: this.state.letter,
                scores: this.state.scores,
                ready: true,
                allReady: false,
                answers: obj
            });
        } else if (m.type === "userfinished" && m.user === user) {

            // get current component state
            var currentState = this.state;

            currentState.finished = true;
            this.setState({
                currentState
            });

        } else if (m.type === "allfinished") {
            // get current component state
            var currentState = this.state;

            currentState.inGame = false;
            currentState.ready = false;
            currentState.allReady = false;
            currentState.finished = false;
            this.setState({
                currentState
            });
        } else if (m.type === "evalstate") {
            // get current component state
            var currentState = this.state;

            // append evalstate to component state
            currentState.evalstate = m.state;
            currentState.finished = false;

            this.setState({
                currentState
            });
            console.log(this.state.evalstate);

            // update interface
            this.updateEvalInterface();
        }
    }

    // update the evaluation phase interface
    updateEvalInterface() {
        for (var member in this.state.evalstate.members) {
            if (this.state.evalstate.members.hasOwnProperty(member)) {
                for (var cat in this.state.evalstate.members[member].answers) {
                    // update the answer checkboxes
                    $('#' + cat + '-' + this.state.evalstate.members[member].name).prop('checked',
                        this.state.evalstate.members[member].answers[cat]);

                    // update player round score
                    $('#' + this.state.evalstate.members[member].name + '-score').text("Round Score: " +
                        this.state.evalstate.members[member].score);
                }

            }
        }
    }

    // lock the game room
    lockRoom() {
        $.ajax({
            url: "/lockroom",
            data: JSON.stringify( { "room": room } ),
            method: "post",
            contentType: "application/json"
        });
    }

    // alert server of user being ready
    userReady() {
        var obj = {};

        $("#answers :input").each(function() {
            if ($(this).attr("type") === "text"){
                var id = $(this).attr("id");
                obj[id] = $(this).val().toString();
            }
        });

        $.ajax({
            url: "/answers",
            data: JSON.stringify( {
                "answers": obj,
                "user": user,
                "room": room
            } ),
            method: "post",
            contentType: "application/json",
            success: function (msg) {
                $.ajax({
                    url: "/userready",
                    data: JSON.stringify( {
                        "room": room,
                        "user": user
                    } ),
                    method: "post",
                    contentType: "application/json"
                });
            }
        });

    }

    // alert server of user being ready
    userFinished() {
        $.ajax({
            url: "/userfinished",
            data: JSON.stringify( {
                "room": room,
                "user": user
            } ),
            method: "post",
            contentType: "application/json"
        });
    }

    // handles modification of a user's score
    modifyScore(check, member) {
        $.ajax({
            url: "/toggleanswer",
            data: JSON.stringify( {
                "room": room,
                "user": member,
                "category": check
            } ),
            method: "post",
            contentType: "application/json"
        });
    }

    render() {
        if (!this.state.inGame) {
            if (this.state.hasOwnProperty("scores")) {
                // generate html for player scores if rounds have already been played
                var scoresHtml = [];
                for (var player in this.state.scores) {
                    if (this.state.scores.hasOwnProperty(player)) {
                        scoresHtml.push(
                            <p>{player}: {this.state.scores[player]}</p>
                        );
                    }
                }

                return (
                    <div>
                        <h4>Scores:</h4>
                        {scoresHtml}
                        <hr/>
                        <p>Click button to begin next round...</p>
                        <button onClick={this.lockRoom.bind(this)}>Start Game</button>
                    </div>
                );
            } else {
                return (
                    <div>
                        <p>Wait for all players to join, then click button to begin...</p>
                        <button onClick={this.lockRoom.bind(this)}>Start Game</button>
                    </div>
                );
            }
        } else if (this.state.ready !== true) {
            // generate html for player scores
            var scoresHtml = [];
            for (var player in this.state.scores) {
                if (this.state.scores.hasOwnProperty(player)) {
                    scoresHtml.push(
                        <p>{player}: {this.state.scores[player]}</p>
                    );
                }
            }

            return (
                <div id="answers">
                    <h4>Scores:</h4>
                    {scoresHtml}
                    <hr/>
                    <p>The current letter is... {this.state.letter}</p>
                    <br/>
                    <div className="input-group">
                        <span className="input-group-addon" id="basic-addon1">Fictional Character</span>
                        <input id="character" type="text" className="form-control" placeholder="Enter here..." aria-describedby="basic-addon1" />
                    </div>
                    <br/>
                    <div className="input-group">
                        <span className="input-group-addon" id="basic-addon4">Notable Person</span>
                        <input id="person" type="text" className="form-control" placeholder="Enter here..." aria-describedby="basic-addon4" />
                    </div>
                    <br/>
                    <div className="input-group">
                        <span className="input-group-addon" id="basic-addon2">Location</span>
                        <input id="location" type="text" className="form-control" placeholder="Enter here..." aria-describedby="basic-addon2" />
                    </div>
                    <br/>
                    <div className="input-group">
                        <span className="input-group-addon" id="basic-addon3">Animal</span>
                        <input id="animal" type="text" className="form-control" placeholder="Enter here..." aria-describedby="basic-addon3" />
                    </div>
                    <br/>
                    <div className="input-group">
                        <span className="input-group-addon" id="basic-addon5">Music Genre</span>
                        <input id="music" type="text" className="form-control" placeholder="Enter here..." aria-describedby="basic-addon5" />
                    </div>
                    <br/>
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

            // generate user answer checkbox panels
            for (var member in this.state.evalstate.members) {
                if (this.state.evalstate.members.hasOwnProperty(member)) {
                    var checkBoxes = [];

                    // generate a checkbox for each answer
                    for (var property in this.state.evalstate.members[member].answers) {
                        if (this.state.evalstate.members[member].answers.hasOwnProperty(property)) {
                            checkBoxes.push(
                                <div className="results-input-group" key={property + "-" + this.state.evalstate.members[member].name + "-group"}>
                                    <span className="input-group-addon">
                                        {property}: {this.state.playerAnswers[member][property]}
                                    </span>
                                    <span className="input-group-addon">
                                        <input type="checkbox" aria-label="..." id={property + "-" + this.state.evalstate.members[member].name}
                                               onClick={this.modifyScore.bind(this, property, this.state.evalstate.members[member].name)}/>
                                    </span>
                                    <br/>
                                </div>
                            );
                        }
                    }

                    // push panel with imbedded answer checkboxes to list
                    answersHtml.push(
                        <div className="col-md-4">
                            <div className="panel panel-default">
                                <div className="panel-heading">{this.state.evalstate.members[member].name}</div>
                                <div className="panel-body">
                                    <p id={this.state.evalstate.members[member].name + "-score"}>Round Score: 0</p>
                                    {checkBoxes}
                                </div>
                            </div>
                        </div>
                    );
                }
            }

            // determine what to show depending on whether user has accepted eval state
            var finishedComponent = [];
            if (this.state.finished) {
                finishedComponent.push(
                    <p>Awaiting other players to confirm...</p>
                );
            } else {
                finishedComponent.push(
                    <button id="finished-button" onClick={this.userFinished.bind(this)}>Finished!</button>
                );
            }

            // generate html for player scores
            var scoresHtml = [];
            for (var player in this.state.scores) {
                if (this.state.scores.hasOwnProperty(player)) {
                    scoresHtml.push(
                        <p>{player}: {this.state.scores[player]}</p>
                    );
                }
            }

            // update interface
            return (
                <div>
                    <h4>Scores:</h4>
                    {scoresHtml}
                    <hr/>
                    <p>Current Letter: {this.state.letter}</p>
                    <br/>

                    <div className="row">
                        {answersHtml}
                    </div>

                    {finishedComponent}
                </div>
            )
        }
    }
}

React.render(
    <Game />,
    document.getElementById('content')
);