package controllers

import javax.inject._

import akka.stream.Materializer
import play.api.libs.EventSource
import play.api.mvc._
import models.Room

// TODO
//   - fragment this class into several different controllers

/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject() (implicit val mat: Materializer) extends Controller {

  var rooms = Map[String, Room]()

  def index = Action {
    Ok(views.html.index("Boilerplate Project"))
  }

  /**
    * Enter an existing game room
    * @param room - id of room to join
    * @return page of room
    */
  def enterRoom(room: String) = Action {
    Ok(
      if (rooms.contains(room)) {
        if (rooms(room).locked) {
          views.html.noroom("This room is locked")
        } else {
          views.html.room(room, room)
        }
      } else {
        views.html.noroom("No such room")
      }
    )
  }

  /**
    * Provides a real-time feed of users in room
    * @param room id of room
    * @return an event stream of users
    */
  def userFeed(room: String) = Action { _ =>
    println("Someone joined room " + room)
    Ok.chunked(rooms(room).usersOut &> EventSource()).as("text/event-stream")
  }


  def gameFeed(room: String) = Action { _ =>
    Ok.chunked(rooms(room).gameOut &> EventSource()).as("text/event-stream")
  }

  /**
    * Create a new game room
    * @return id of the newly created room
    */
  def createRoom() = Action(parse.json) { req =>
    // generate random room id
    val r = scala.util.Random
    val id = (for (_ <- 0 to 5) yield r.alphanumeric.filter(_.isLetter).head)
      .toList.mkString

    // add new room to rooms
    rooms += (id -> new Room(id))
    println("Current rooms: " + rooms.keySet)

    // respond to client
    Ok(id)
  }

  /**
    * Adds a new user to a room
    * @return success status
    */
  def newUser() = Action(parse.json) { req =>
    // extract data from request
    val user = req.body.\\("user").head.toString.replaceAll("\"", "")
    val room = req.body.\\("room").head.toString.replaceAll("\"", "")

    println(s"$user / $room")

    // add user to room's users
    rooms(room).addUser(user)
    println(room + " members: " + rooms(room).users.keys)
    Ok(s"$user -> $room")
  }

  /**
    * Removes a user from a room
    * @return success status
    */
  def removeUser() = Action(parse.json) { req =>
    // TODO:
    //  - trigger user list broadcast event
    //  - fix faulty room deletion

    // extract data from request
    val user = req.body.\\("user").head.toString.replaceAll("\"", "")
    val room = req.body.\\("room").head.toString.replaceAll("\"", "")

    println(s"$user has left room $room...")

    // if there are more than one user
    if (rooms(room).users.size > 1) {
      // remove this user from room
      rooms(room).users = rooms(room).users.filter(_!=user)
      println(room + " members: " + rooms(room).users)
    } else {
      // delete the room
      rooms -= room
      println("Current rooms: " + rooms.keySet)
    }

    Ok
  }

  /**
    * Locks a room, preventing further users from joining
    * TODO:
    *   - handle room locking before player has entered name
    *   - improve failed room join page
    *   - handle unlocking of room
    * @return success status
    */
  def lockRoom() = Action(parse.json) { req =>
    val room = req.body.\\("room").head.toString.replaceAll("\"", "")
    rooms(room).startGame()
    println(s"Room $room has been locked...")
    Ok
  }

  def userReady() = Action(parse.json) { req =>
    val room = req.body.\\("room").head.toString.replaceAll("\"", "")
    val user = req.body.\\("user").head.toString.replaceAll("\"", "")

    // TODO - improve username acquisition
    rooms(room).ready(user)

    Ok
  }
}
