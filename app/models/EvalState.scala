package models

class EvalState (room: String, users: List[String]) {

  var memberStates = clearState()

  def clearState() = {
    users.map { name =>
      new EvalMember(name)
    }
  }

}
