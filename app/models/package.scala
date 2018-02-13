import play.api.libs.json.{Json, Writes}

package object models {

  /**
    * Writes an EvalMember to JSON format
    */
  implicit val memberWrites = new Writes[EvalMember] {
    def writes(member: EvalMember) = Json.obj(
      "name" -> Json.toJsFieldJsValueWrapper(member.name),
      "answers" -> Json.toJsFieldJsValueWrapper(
        Json.toJson(member.answerMatrix)
      ),
      "score" -> Json.toJsFieldJsValueWrapper(member.roundScore)
    )
  }

  /**
    * Writes an EvalState to JSON format
    */
  implicit val stateWrites = new Writes[EvalState] {
    def writes(state: EvalState) = Json.obj(
      "room" -> Json.toJsFieldJsValueWrapper(state.room),
      "members" -> Json.toJsFieldJsValueWrapper(
        Json.toJson(
          state.memberStates.map { case (_, userState) =>
            Json.toJson(userState)
          }
        )
      )
    )
  }

}
