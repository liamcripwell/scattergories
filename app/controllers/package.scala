import models.{EvalMember, EvalState, Room}
import play.api.libs.json.{Json, Writes}

package object controllers {

  var rooms = Map[String, Room]()

}
