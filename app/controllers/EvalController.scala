package controllers

import javax.inject.{Inject, Singleton}

import akka.stream.Materializer
import play.api.mvc.{Action, Controller}

@Singleton
class EvalController @Inject() (implicit val mat: Materializer) extends Controller {

  def requestEvalState() = Action(parse.json) { req =>

    val room = req.body.\\("room").head.toString.replaceAll("\"", "")

    Ok
  }

  def toggleAnswer() = Action(parse.json) { req =>
    // process request content
    val room = req.body.\\("room").head.toString.replaceAll("\"", "")
    val user = req.body.\\("user").head.toString.replaceAll("\"", "")
    val category = req.body.\\("category").head.toString.replaceAll("\"", "")

    // disable finished statuses
    rooms(room).users.foreach { case (_, value) =>
      value.finished = false
    }

    // change the room's evaluation state
    rooms(room).changeEvalState(user, category)

    Ok
  }

}
