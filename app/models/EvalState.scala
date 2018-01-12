package models

class EvalState (val room: String, val users: Map[String, User]) {

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
