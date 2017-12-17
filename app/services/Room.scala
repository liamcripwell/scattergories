package services

import play.api.libs.iteratee.Concurrent
import play.api.libs.json.{JsValue, Json}

/**
  * A room that a set of users will play games within
  *
  * @param id - room identifier
  */
class Room(id: String) {

  // broadcast channels
  val (usersOut, usersChannel) = Concurrent.broadcast[JsValue]
  val (gameOut, gameChannel) = Concurrent.broadcast[JsValue]

  var users = List[String]()
  var locked = false

  /**
    * Adds the user to users and pushes event into event channel
    * @param user name of the new user
    */
  def addUser(user: String): Unit = {
    if (!locked) {
      users = users :+ user

      // push current set of users to channel
      usersChannel.push(Json.obj(
        "users" -> Json.toJsFieldJsValueWrapper(users)
      ))
    }
  }

  def startGame(): Unit = {
    locked = true
    gameChannel.push(Json.obj(
      "type" -> Json.toJsFieldJsValueWrapper("start")
    ))
  }

}