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
        } else if (m.type === "userready" && m.user === user) {

            var answerInputs = [];

            $("#answers :input").each(function() {
                if ($(this).attr("type") === "text"){
                    var id = $(this).attr("id");

                    answerInputs.push($(this).val().toString());
                }
            });

            console.log(answerInputs.length);
            answerInputs.forEach(function(x){console.log(x)})

            this.setState({
                inGame: true,
                letter: this.state.letter,
                ready: true,
                answers: answerInputs
            });
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
        } else if (this.state.ready) {
            return (
                <div>
                    <p>Your answers were..</p>
                    {
                        this.state.answers.map(x => <li>{x}</li>)
                    }
                    <br/>
                    <p>Current Letter: {this.state.letter}</p>
                </div>
            )
        }
    }
}

React.render(
    <Game />,
    document.getElementById('content')
);