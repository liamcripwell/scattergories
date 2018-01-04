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

    // add user to room and send result to client
    rooms(room).addUser(user)

    Ok
  }

  /**
    * Removes a user from a room
    * @return success status
    */
  def removeUser() = Action(parse.json) { req =>
    // extract data from request
    val user = req.body.\\("user").head.toString.replaceAll("\"", "")
    val room = req.body.\\("room").head.toString.replaceAll("\"", "")

    // remove user from room
    rooms(room).removeUser(user)

    // delete empty rooms
    if (rooms(room).users.isEmpty) {
      rooms -= room
      println("Current rooms: " + rooms.keySet)
    }

    Ok
  }

  /**
    * Locks a room, preventing further users from joining
    * TODO:
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
