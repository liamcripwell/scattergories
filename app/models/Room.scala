package models

import java.util.Locale.Category

import controllers.rooms
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

  var users = Map[String, User]()
  var locked = false

  val r = scala.util.Random
  var letter = r.alphanumeric.filter(_.isLetter).head.toUpper.toString
  var evalState = new EvalState(id, users)

  /**
    * Adds the user to users and pushes event into event channel
    * @param name name of the new user
    */
  def addUser(name: String): Boolean = {
    if (!locked) {

      if (users.contains(name)) {
        // append with a number in ()'s if a duplicate name is encountered
        addUser(
          if (")" == (name takeRight 1)) {
            name.dropRight(2) + (name.takeRight(2).head.asDigit + 1).toString + ")"
          } else { name + "(2)"}
        )
      } else {
        // add new user to to users
        users += name -> new User(name)

        println(s"$name has joined room $id...")
        println(id + " members: " + users.keys)

        // push current set of users to channel
        usersChannel.push(Json.obj(
          "users" -> Json.toJsFieldJsValueWrapper(users.keys)
        ))

        true
      }

    } else { false }
  }

  /**
    * Removes user from room and pushes event into event channel
    * @param name name of the new user
    */
  def removeUser(name: String): Unit = {
    users -= name

    println(s"$name has left room $id...")
    println(id + " members: " + users.keys)

    // push current set of users to channel
    usersChannel.push(Json.obj(
      "users" -> Json.toJsFieldJsValueWrapper(users.keys)
    ))
  }

  def startGame(): Unit = {
    // lock room and reset evalState
    locked = true
    evalState = new EvalState(id, users)

    gameChannel.push(Json.obj(
      "type" -> Json.toJsFieldJsValueWrapper("start"),
      "letter" -> Json.toJsFieldJsValueWrapper(letter)
    ))
  }

  def changeEvalState(user: String, category: String): Unit = {
    evalState.toggleAnswer(user, category)

    gameChannel.push(Json.obj(
      "type" -> Json.toJsFieldJsValueWrapper("evalstate"),
      "state" -> Json.toJsFieldJsValueWrapper(Json.toJson(evalState))
    ))
  }

  def ready(name: String): Unit = {
    users(name).ready = true

    gameChannel.push(Json.obj(
      "type" -> Json.toJsFieldJsValueWrapper("userready"),
      "user" -> Json.toJsFieldJsValueWrapper(name)
    ))
  }

}