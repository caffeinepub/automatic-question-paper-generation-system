import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Principal "mo:core/Principal";

module {
  type SubjectId = Text;
  type QuestionId = Nat;
  type PaperId = Nat;

  type OldQuestionCategory = {
    #_2Marks;
    #_4Marks;
    #_6Marks;
    #_8Marks;
    #mcq;
  };

  type NewQuestionCategory = {
    #_2Marks;
    #_4Marks;
    #_6Marks;
    #_8Marks;
    #mcqOneMark;
  };

  type DifficultyLevel = {
    #easy;
    #medium;
    #hard;
  };

  type Subject = {
    id : SubjectId;
    name : Text;
    code : Text;
  };

  type OldQuestion = {
    id : QuestionId;
    subjectId : SubjectId;
    category : OldQuestionCategory;
    questionText : Text;
    options : ?[Text];
    correctAnswer : ?Text;
    difficultyLevel : DifficultyLevel;
    timestamp : Int;
  };

  type NewQuestion = {
    id : QuestionId;
    subjectId : SubjectId;
    category : NewQuestionCategory;
    questionText : Text;
    options : ?[Text];
    correctAnswer : ?Text;
    difficultyLevel : DifficultyLevel;
    timestamp : Int;
  };

  type PaperVariant = {
    variant : Text;
    questions : [QuestionId];
  };

  type GeneratedPaper = {
    id : PaperId;
    subjectId : SubjectId;
    subjectName : Text;
    examDuration : Int;
    totalMarks : Int;
    questions : [QuestionId];
    setVariants : [PaperVariant];
    createdAt : Int;
    teacherId : Principal;
  };

  type OldActor = {
    subjects : Map.Map<SubjectId, Subject>;
    questions : Map.Map<QuestionId, OldQuestion>;
    papers : Map.Map<PaperId, GeneratedPaper>;
    nextQuestionId : QuestionId;
    nextPaperId : PaperId;
  };

  type NewActor = {
    subjects : Map.Map<SubjectId, Subject>;
    questions : Map.Map<QuestionId, NewQuestion>;
    papers : Map.Map<PaperId, GeneratedPaper>;
    nextQuestionId : QuestionId;
    nextPaperId : PaperId;
  };

  public func run(old : OldActor) : NewActor {
    let newQuestions = old.questions.map<QuestionId, OldQuestion, NewQuestion>(
      func(_id, oldQuestion) {
        {
          oldQuestion with category = convertCategory(oldQuestion.category)
        };
      }
    );

    {
      old with
      questions = newQuestions
    };
  };

  func convertCategory(oldCategory : OldQuestionCategory) : NewQuestionCategory {
    switch (oldCategory) {
      case (#mcq) { #mcqOneMark };
      case (#_2Marks) { #_2Marks };
      case (#_4Marks) { #_4Marks };
      case (#_6Marks) { #_6Marks };
      case (#_8Marks) { #_8Marks };
    };
  };
};
