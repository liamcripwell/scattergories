package models

class EvalState (val room: String, val users: Map[String, User]) {

  var memberStates: Map[String, EvalMember] = clearState()

  def clearState() = {
    users.map { case(name, _) =>
      name -> new EvalMember(name)
    }
  }

  def toggleAnswer(user: String, category: String): Unit = {
    memberStates(user).toggleAnswer(category)
    updateScores()
  }

  def updateScores(): Unit = {
    memberStates.foreach { case (name, state) =>
      // update member's score
      state.roundScore = state.answerMatrix.map { case (_, ans) =>
        if (ans) 1 else 0
      }.sum

      println(s"$name's round score : ${state.roundScore}")
    }
  }

}
