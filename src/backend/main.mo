import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";

import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";


actor {
  type SubjectId = Text;
  type QuestionId = Nat;
  type PaperId = Nat;

  type QuestionCategory = {
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

  type Question = {
    id : QuestionId;
    subjectId : SubjectId;
    category : QuestionCategory;
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

  let subjects = Map.empty<SubjectId, Subject>();
  let questions = Map.empty<QuestionId, Question>();
  let papers = Map.empty<PaperId, GeneratedPaper>();
  var nextQuestionId : QuestionId = 1;
  var nextPaperId : PaperId = 1;

  module Subject {
    public func compare(s1 : Subject, s2 : Subject) : Order.Order {
      Text.compare(s1.id, s2.id);
    };
  };

  module Question {
    public func compare(q1 : Question, q2 : Question) : Order.Order {
      Nat.compare(q1.id, q2.id);
    };
  };

  module PaperVariant {
    public func compare(pv1 : PaperVariant, pv2 : PaperVariant) : Order.Order {
      Text.compare(pv1.variant, pv2.variant);
    };
  };

  module GeneratedPaper {
    public func compare(p1 : GeneratedPaper, p2 : GeneratedPaper) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  public shared ({ caller }) func addSubject(id : SubjectId, name : Text, code : Text) : async () {
    if (subjects.containsKey(id)) { Runtime.trap("Subject already exists!") };

    let subject : Subject = {
      id;
      name;
      code;
    };
    subjects.add(id, subject);
  };

  public shared ({ caller }) func addQuestion(
    subjectId : SubjectId,
    category : QuestionCategory,
    questionText : Text,
    options : ?[Text],
    correctAnswer : ?Text,
    difficultyLevel : DifficultyLevel,
  ) : async () {
    let question : Question = {
      id = nextQuestionId;
      subjectId;
      category;
      questionText;
      options;
      correctAnswer;
      difficultyLevel;
      timestamp = 0; // Placeholder for now
    };
    questions.add(nextQuestionId, question);
    nextQuestionId += 1;
  };

  public shared ({ caller }) func addQuestionsInBulk(questionsArray : [Question]) : async Nat {
    let validQuestions = questionsArray.filter(
      func(q) { questions.get(q.id) == null }
    );

    validQuestions.forEach(
      func(q) {
        questions.add(q.id, q);
      }
    );

    validQuestions.size();
  };

  public query ({ caller }) func getQuestionsBySubjectAndCategory(subjectId : SubjectId, category : QuestionCategory) : async [Question] {
    questions.values().toArray().filter(
      func(q) {
        q.subjectId == subjectId and q.category == category
      }
    );
  };

  public query ({ caller }) func getAllVariants() : async [Text] {
    let variants = List.empty<Text>();
    variants.add("A");
    variants.add("B");
    variants.add("C");
    variants.add("D");
    variants.add("E");
    variants.toArray();
  };

  public query ({ caller }) func getQuestions() : async [Question] {
    questions.values().toArray();
  };
};
