class MyComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            score: 0
        };
    }

    increment() {
        this.setState({
            score: this.state.score+1
        });
    }

    newRoom() {
        $.ajax({
            url: "/newroom",
            data: JSON.stringify({}),
            method: "post",
            contentType: "application/json",
            success: function (msg) {
                console.log(msg);
                //this.history.pushState(null, "/room/" + msg);
                window.location.href = "/room/" + msg;
            }
        })
    }

    render() {
        return (
        <div>
            <h3>Current score: {this.state.score}.</h3>
            <button onClick={this.increment.bind(this)}>Increment</button>
            <button onClick={this.newRoom}>Create new room</button>
        </div>
        );
    }
}

React.render(
    <MyComponent />,
    document.getElementById('content')
);