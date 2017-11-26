package controllers

import javax.inject._

import play.api._
import play.api.mvc._
import services.Room


/**
 * This controller creates an `Action` to handle HTTP requests to the
 * application's home page.
 */
@Singleton
class HomeController @Inject() extends Controller {

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
    * Create a new game room
    * @return
    */
  def createRoom = Action(parse.json) { req =>
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

  def newUser = Action(parse.json) { req =>
    // extract data from request
    val user = req.body.\\("user").head.toString.replaceAll("\"", "")
    val room = req.body.\\("room").head.toString.replaceAll("\"", "")

    // add user to room's users
    rooms(room).users = rooms(room).users :+ user
    println(room + " members: " + rooms(room).users)

    Ok
  }

}
