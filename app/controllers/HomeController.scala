package controllers

import javax.inject._

import akka.stream.Materializer
import play.api._
import play.api.libs.EventSource
import play.api.libs.iteratee.{Concurrent, Enumerator}
import play.api.libs.json.{JsValue, Json}
import play.api.mvc._
import services.Room


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
    * @param room - id of room to koin
    * @return page of room
    */
  def enterRoom(room: String) = Action {
    if (rooms.contains(room)) {
      Ok(views.html.room(room, room))
    } else {
      Ok(views.html.noroom("No such room"))
    }
  }

  /**
    * Provides a real-time feed of users in room
    * @param room id of room
    * @return an event stream of users
    */
  def userFeed(room: String) = Action { req =>
    println("Someone joined room " + room)

    println(rooms(room).users.mkString(", "))

    // get users already in room
    val existingUsers = rooms(room).users
      .map { x =>
        Enumerator.apply[JsValue](Json.obj("user" -> x))
      }

    // pushes existing users onto the event stream
    def accumulate(res: Enumerator[JsValue], x: Enumerator[JsValue]) = {
      x >>> res
    }

    println(existingUsers.length)

    // return event stream with all existing users pushed
    Ok.chunked(
      existingUsers.foldLeft(rooms(room).usersOut)(accumulate)
        &> EventSource()).as("text/event-stream")
  }

  /**
    * Create a new game room
    * @return id of the newly created room
    */
  def createRoom() = Action(parse.json) { req =>
    // generate random room id
    val r = scala.util.Random
    val id = (for (i <- 0 to 5) yield r.alphanumeric.filter(_.isLetter).head)
      .toList.mkString

    // add new room to rooms
    rooms += (id -> new Room(id))
    println("Current rooms: " + rooms.keySet)

    // respond to client
    Ok(id)
  }

  def removeRoom(room: String): Unit = {
    rooms -= room
    println("Current rooms: " + rooms.keySet)
  }

  /**
    * Adds a new user to a room
    * @return
    */
  def newUser() = Action(parse.json) { req =>
    // extract data from request
    val user = req.body.\\("user").head.toString.replaceAll("\"", "")
    val room = req.body.\\("room").head.toString.replaceAll("\"", "")

    // add user to room's users
    rooms(room).addUser(user)
    println(room + " members: " + rooms(room).users)
    Ok
  }

  /**
    * Removes a user from a room
    * @return
    */
  def removeUser() = Action(parse.json) { req =>
    // extract data from request
    val user = req.body.\\("user").head.toString.replaceAll("\"", "")
    val room = req.body.\\("room").head.toString.replaceAll("\"", "")

    // remove user from room's users
    rooms(room).users.size match {
      case x if x > 1 =>
        rooms(room).users = rooms(room).users.filter(_!=user)
        println(room + " members: " + rooms(room).users)
      case _          => removeRoom(room)
    }
    Ok
  }

}
