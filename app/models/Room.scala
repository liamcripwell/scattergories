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
      "letter" -> Json.toJsFieldJsValueWrapper(letter),
      "scores"  -> Json.toJsFieldJsValueWrapper(users.map{
        case (userName, user) => (userName, user.score)
      })
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

    println(s"$name in room $id is ready...")

    gameChannel.push(Json.obj(
      "type" -> Json.toJsFieldJsValueWrapper("userready"),
      "user" -> Json.toJsFieldJsValueWrapper(name)
    ))

    // if all users are ready
    if (users.values.count(!_.ready) < 1) {
      println(s"All users in room $id are ready...")

      gameChannel.push(Json.obj(
        "type"    -> Json.toJsFieldJsValueWrapper("allready"),
        "members" -> Json.toJsFieldJsValueWrapper(users.keys)
      ))
    }
  }

  def finished(name: String): Unit = {
    users(name).finished = true

    println(s"$name in room $id is finished...")

    gameChannel.push(Json.obj(
      "type" -> Json.toJsFieldJsValueWrapper("finished"),
      "user" -> Json.toJsFieldJsValueWrapper(name)
    ))

    // if all users are finished
    if (users.values.count(!_.finished) < 1) {
      println(s"All users in room $id are finished...")

      gameChannel.push(Json.obj(
        "type"    -> Json.toJsFieldJsValueWrapper("allfinished")
      ))
    }
  }

  /**
    * Updates a user's score by a specified amount
    * @param name the user's name
    * @param scoreIncrease the amount to add to existing score
    */
  def updateScore(name: String, scoreIncrease: Int): Unit = {
    users(name).score += scoreIncrease

    println(s"$name's score has been updated to: ${users(name).score}")
  }

}