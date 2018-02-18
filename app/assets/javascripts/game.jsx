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
            currentState.scores = m.scores;
            currentState.members = m.members;
            currentState.playerAnswers = m.playerAnswers;

            console.log(currentState.playerAnswers);

            this.setState({
                currentState
            });

        } else if (m.type === "userready" && m.user === user) {

            var answerInputs = [];
            var obj = {};
            var tups = [];

            $("#answers :input").each(function() {
                if ($(this).attr("type") === "text"){
                    var id = $(this).attr("id");
                    obj[id] = $(this).val().toString();
                    tups.push((id.toString() + ">>" +  $(this).val().toString()));
                }
            });

            answerInputs.push(obj);

            answerInputs.forEach(function(x){console.log(x)})

            this.setState({
                inGame: true,
                letter: this.state.letter,
                ready: true,
                allReady: false,
                answers: obj
            });
        } else if (m.type === "userfinished" && m.user === user) {

            console.log("You are finished...");

            // get current component state
            var currentState = this.state;

            currentState.finished = true;
            this.setState({
                currentState
            });

        } else if (m.type === "allfinished") {
            // get current component state
            var currentState = this.state;

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
                    console.log(this.state.evalstate.members[member].name + " ~ " + cat + ": " +
                        this.state.evalstate.members[member].answers[cat]);

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
            contentType: "application/json",
            success: function (msg) {
                console.log(msg);
            }
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
                console.log(msg);

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
            contentType: "application/json",
            success: function (msg) {
                console.log(msg);
            }
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

            // generate user answer checkbox panels
            for (var member in this.state.evalstate.members) {
                if (this.state.evalstate.members.hasOwnProperty(member)) {
                    console.log(member);
                    console.log("member: " + this.state.evalstate.members[member].name);

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
                        <div className="panel panel-default">
                            <div className="panel-heading">{this.state.evalstate.members[member].name}</div>
                            <div className="panel-body">
                                <p id={this.state.evalstate.members[member].name + "-score"}>Round Score: 0</p>
                                {checkBoxes}
                            </div>
                        </div>
                    );
                }
            }

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

            // update interface
            return (
                <div>
                    <p>Current Letter: {this.state.letter}</p>
                    <br/>

                    <div className="row">
                        <div className="col-xs-2 col-md-1">
                        </div>
                        <div className="col-xs-6 col-md-4">
                            {answersHtml}
                        </div>
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