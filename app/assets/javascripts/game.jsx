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

    // update the evaluation phase interface
    updateEvalInterface() {
        for (var member in this.state.evalstate.members) {
            if (this.state.evalstate.members.hasOwnProperty(member)) {
                for (var cat in this.state.evalstate.members[member].answers) {
                    console.log(this.state.members[member] + " ~ " + cat + ": " +
                        this.state.evalstate.members[member].answers[cat]);

                    // update the answer checkboxes
                    $('#' + cat + '-' + this.state.members[member]).prop('checked',
                        this.state.evalstate.members[member].answers[cat]);

                    // update player round score
                    $('#' + this.state.members[member] + '-score').text("Round Score: " +
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
    modifyScore(check, member) {
        if($("#" + check).is(":checked")){
            console.log(check);
        } else {
            console.log("poo");
        }

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

            // generate user answer checkbox panels
            for (var member in this.state.members) {
                if (this.state.members.hasOwnProperty(member)) {
                    console.log("member: " + this.state.members[member]);

                    var checkBoxes = [];

                    // generate a checkbox for each answer
                    for (var property in this.state.answers) {
                        if (this.state.answers.hasOwnProperty(property)) {
                            checkBoxes.push(
                                <div className="results-input-group" key={property + "-" + this.state.members[member] + "-group"}>
                                    <span className="input-group-addon">
                                        {property}: {this.state.answers[property]}
                                    </span>
                                    <span className="input-group-addon">
                                        <input type="checkbox" aria-label="..." id={property + "-" + this.state.members[member]}
                                               onClick={this.modifyScore.bind(this, property, this.state.members[member])}/>
                                    </span>
                                    <br/>
                                </div>
                            );
                        }
                    }

                    // push panel with imbedded answer checkboxes to list
                    answersHtml.push(
                        <div className="panel panel-default">
                            <div className="panel-heading">{this.state.members[member]}</div>
                            <div className="panel-body">
                                <p id={this.state.members[member] + "-score"}>Round Score: 0</p>
                                {checkBoxes}
                            </div>
                        </div>
                    );
                }
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
                </div>
            )
        }
    }
}

React.render(
    <Game />,
    document.getElementById('content')
);