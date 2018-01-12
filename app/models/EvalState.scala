package models

class EvalState (room: String, users: Map[String, User]) {

  var memberStates = clearState()

  def clearState() = {
    users.map { case(name, _) =>
      name -> new EvalMember(name)
    }
  }

  def toggleAnswer(user: String, category: String): Unit = {
    memberStates(user).toggleAnswer(category)
  }

}
