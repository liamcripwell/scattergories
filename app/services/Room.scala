package services

import play.api.libs.iteratee.Concurrent
import play.api.libs.json.{JsValue, Json}

/**
  * A room that a set of users will play games within
  *
  * @param id - room identifier
  */
class Room(id: String) {

  var users = List[String]()
  val (usersOut, usersChannel) = Concurrent.broadcast[JsValue]

  /**
    * Adds the user to users and pushes event into event channel
    * @param user name of the new user
    */
  def addUser(user: String): Unit = {
    users = users :+ user
//    usersChannel.push(Json.obj(
//      "user" -> Json.toJsFieldJsValueWrapper(user)
//    ))

    usersChannel.push(Json.obj(
      "users" -> Json.toJsFieldJsValueWrapper(users)
    ))
  }
}