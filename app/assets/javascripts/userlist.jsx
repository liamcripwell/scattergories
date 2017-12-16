class MyComponent extends React.Component {

    constructor(props) {
        super(props);

        // adds a new event which updates a user count whenever a new
        // user joins the room
        var feed = new EventSource("/userfeed/" + room);
        feed.addEventListener("message", function(msg){
            var m = JSON.parse(msg.data);
            this.newGuy(m.users.length)
        }.bind(this));

        this.state = {
            score: 0
        };
    }

    // update state variable "score"
    newGuy(numUsers) {
        this.setState({
            score: numUsers
        });
    }

    render() {
        return (
            <div>
            <h3>Current user count: {this.state.score}</h3>
            </div>
        );
    }
}

React.render(
    <MyComponent />,
    document.getElementById('content')
);