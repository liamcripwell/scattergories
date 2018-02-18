package models

class EvalMember (val name: String) {

  var roundScore = 0
  var agreement = false
  var answerMatrix: Map[String, Boolean] = Map(
    "character" -> false,
    "person"    -> false,
    "location"  -> false,
    "animal"    -> false,
    "music"     -> false
  )

  /**
    * Toggles the true/false value of a specified answer
    * @param category the category of which to toggle the answer of
    */
  def toggleAnswer(category: String): Unit = {

    if (answerMatrix.contains(category)) {
      answerMatrix += (category -> !answerMatrix(category))
      println(s"Modified answer of $name: $category -> ${answerMatrix(category)}")
    } else {
      println("The specified category doesn't exist within this specification...")
    }
  }

}
