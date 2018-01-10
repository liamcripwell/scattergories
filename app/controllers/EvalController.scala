package controllers

import javax.inject.{Inject, Singleton}

import akka.stream.Materializer
import play.api.mvc.Controller

@Singleton
class EvalController @Inject() (implicit val mat: Materializer) extends Controller {


}
