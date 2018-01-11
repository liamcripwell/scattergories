package models

class EvalMember {

  var roundScore = 0
  var agreement = true
  var answerMatrix = Map(
    "character" -> false,
    "location"  -> false,
    "animal"    -> false
  )

  /**
    * Toggles the true/false value of a specified answer
    * @param category the category of which to toggle the answer
    */
  def toggleAnswer(category: String): Unit = {

    if (answerMatrix.contains(category)) {
      answerMatrix += (category -> !answerMatrix(category))
      println(s"Modified answer: $category -> ${answerMatrix(category)}")
    }

    println("The specified category doesn't exist within this specification...")
  }

}
