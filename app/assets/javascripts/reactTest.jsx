class MyComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    newRoom() {
        $.ajax({
            url: "/newroom",
            data: JSON.stringify({}),
            method: "post",
            contentType: "application/json",
            success: function (msg) {
                console.log(msg);
                window.location.href = "/room/" + msg;
            }
        })
    }

    render() {
        return (
        <div>
            <button onClick={this.newRoom}>Create new room</button>
        </div>
        );
    }
}

React.render(
    <MyComponent />,
    document.getElementById('content')
);