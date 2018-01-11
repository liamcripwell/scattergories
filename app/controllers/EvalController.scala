package controllers

import javax.inject.{Inject, Singleton}

import akka.stream.Materializer
import play.api.mvc.{Action, Controller}

@Singleton
class EvalController @Inject() (implicit val mat: Materializer) extends Controller {

  def requestEvalState() = Action(parse.json) { req =>

    val room = req.body.\\("room").head.toString.replaceAll("\"", "")

    // respond to client
    Ok(room)
  }

}
