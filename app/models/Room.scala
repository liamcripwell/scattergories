package models

import play.api.libs.iteratee.Concurrent
import play.api.libs.json.{JsValue, Json}

/**
  * A room that a set of users will play games within
  *
  * @param id - room identifier
  */
class Room (id: String) {

  // broadcast channels
  val (usersOut, usersChannel) = Concurrent.broadcast[JsValue]
  val (gameOut, gameChannel) = Concurrent.broadcast[JsValue]

  var users = List[User]()
  var locked = false

  val r = scala.util.Random
  var letter = r.alphanumeric.filter(_.isLetter).head.toUpper.toString

  /**
    * Adds the user to users and pushes event into event channel
    * @param name name of the new user
    */
  // TODO: enforce unique names
  def addUser(name: String): Unit = {
    if (!locked) {
      users = users :+ new User(name)

      // push current set of users to channel
      usersChannel.push(Json.obj(
        "users" -> Json.toJsFieldJsValueWrapper(users.map(_.name))
      ))
    }
  }

  def startGame(): Unit = {
    locked = true
    gameChannel.push(Json.obj(
      "type" -> Json.toJsFieldJsValueWrapper("start"),
      "letter" -> Json.toJsFieldJsValueWrapper(letter)
    ))
  }

  def ready(name: String): Unit = {
    users.find(_.name == name).get.ready = true

    gameChannel.push(Json.obj(
      "type" -> Json.toJsFieldJsValueWrapper("userready"),
      "user" -> Json.toJsFieldJsValueWrapper(name)
    ))
  }

}