import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

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

  type UserProfile = {
    name : Text;
    department : ?Text;
    designation : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let subjects = Map.empty<SubjectId, Subject>();
  let questions = Map.empty<QuestionId, Question>();
  let papers = Map.empty<PaperId, GeneratedPaper>();
  var nextQuestionId = 1 : QuestionId;
  var nextPaperId = 1 : PaperId;

  // ── User Profile Functions ──────────────────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ── Subject Management (User/Admin) ────────────────────────────────────────

  public shared ({ caller }) func addSubject(name : Text, code : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add subjects");
    };

    let subject : Subject = {
      name;
      code;
    };
    subjects.add(code, subject);
  };

  public shared ({ caller }) func updateSubject(id : SubjectId, name : Text, code : Text) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update subjects");
    };
    switch (subjects.get(id)) {
      case (null) { false };
      case (?_) {
        let updated : Subject = { name; code };
        subjects.add(id, updated);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteSubject(id : SubjectId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete subjects");
    };
    switch (subjects.get(id)) {
      case (null) { false };
      case (?_) {
        subjects.remove(id);
        true;
      };
    };
  };

  public query ({ caller }) func getSubjects() : async [Subject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view subjects");
    };
    subjects.values().toArray();
  };

  public query ({ caller }) func getSubject(id : SubjectId) : async ?Subject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view subjects");
    };
    subjects.get(id);
  };

  // ── Question Management (User/Admin) ───────────────────────────────────────

  public shared ({ caller }) func addQuestion(
    subjectId : SubjectId,
    category : QuestionCategory,
    questionText : Text,
    options : ?[Text],
    correctAnswer : ?Text,
    difficultyLevel : DifficultyLevel,
  ) : async QuestionId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add questions");
    };
    let question : Question = {
      id = nextQuestionId;
      subjectId;
      category;
      questionText;
      options;
      correctAnswer;
      difficultyLevel;
      timestamp = Time.now();
    };
    questions.add(nextQuestionId, question);
    let newId = nextQuestionId;
    nextQuestionId += 1;
    newId;
  };

  public shared ({ caller }) func updateQuestion(id : QuestionId, updatedQuestion : Question) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update questions");
    };
    switch (questions.get(id)) {
      case (null) { false };
      case (?_) {
        questions.add(id, updatedQuestion);
        true;
      };
    };
  };

  public shared ({ caller }) func deleteQuestion(id : QuestionId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete questions");
    };
    switch (questions.get(id)) {
      case (null) { false };
      case (?_) {
        questions.remove(id);
        true;
      };
    };
  };

  public shared ({ caller }) func addQuestionsInBulk(questionsArray : [Question]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can bulk upload questions");
    };
    let validQuestions = questionsArray.filter(
      func(q : Question) : Bool { questions.get(q.id) == null }
    );
    validQuestions.forEach(
      func(q : Question) {
        questions.add(q.id, q);
      }
    );
    validQuestions.size();
  };

  public query ({ caller }) func getQuestions() : async [Question] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view questions");
    };
    questions.values().toArray();
  };

  public query ({ caller }) func getQuestionsBySubjectAndCategory(subjectId : SubjectId, category : QuestionCategory) : async [Question] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view questions");
    };
    questions.values().toArray().filter(
      func(q : Question) : Bool {
        q.subjectId == subjectId and q.category == category
      }
    );
  };

  public query ({ caller }) func getQuestionsBySubject(subjectId : SubjectId) : async [Question] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view questions");
    };
    questions.values().toArray().filter(
      func(q : Question) : Bool { q.subjectId == subjectId }
    );
  };

  // ── Paper Generation (User/Admin) ──────────────────────────────────────────

  public shared ({ caller }) func generatePaper(
    subjectId : SubjectId,
    examDuration : Int,
    totalMarks : Int,
    mcqCount : Nat,
    twoMarkCount : Nat,
    fourMarkCount : Nat,
    sixMarkCount : Nat,
    eightMarkCount : Nat,
  ) : async ?GeneratedPaper {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate papers");
    };

    let subjectOpt = subjects.get(subjectId);
    let subjectName = switch (subjectOpt) {
      case (null) { Runtime.trap("Subject not found") };
      case (?s) { s.name };
    };

    let allQuestions = questions.values().toArray();

    let mcqPool = allQuestions.filter(func(q : Question) : Bool {
      q.subjectId == subjectId and q.category == #mcqOneMark
    });
    let twoMarkPool = allQuestions.filter(func(q : Question) : Bool {
      q.subjectId == subjectId and q.category == #_2Marks
    });
    let fourMarkPool = allQuestions.filter(func(q : Question) : Bool {
      q.subjectId == subjectId and q.category == #_4Marks
    });
    let sixMarkPool = allQuestions.filter(func(q : Question) : Bool {
      q.subjectId == subjectId and q.category == #_6Marks
    });
    let eightMarkPool = allQuestions.filter(func(q : Question) : Bool {
      q.subjectId == subjectId and q.category == #_8Marks
    });

    func pickN(pool : [Question], n : Nat, seed : Nat) : [QuestionId] {
      if (pool.size() == 0 or n == 0) return [];
      var result = List.empty<QuestionId>();
      var i = 0;
      while (i < n and i < pool.size()) {
        let idx = (seed + i * 7 + i) % pool.size();
        result.add(pool[idx].id);
        i += 1;
      };
      result.toArray();
    };

    let variantLabels = ["A", "B", "C", "D", "E"];
    let now = Time.now();
    let baseSeed = Int.abs(now % 1000000);

    let variants = variantLabels.map(func(variantLabel : Text) : PaperVariant {
      let seed = baseSeed + (if (variantLabel == "A") { 0 } else if (variantLabel == "B") { 13 } else if (variantLabel == "C") { 29 } else if (variantLabel == "D") { 47 } else { 61 });
      let selected = List.empty<QuestionId>();
      pickN(mcqPool, mcqCount, seed).forEach(func(id : QuestionId) { selected.add(id) });
      pickN(twoMarkPool, twoMarkCount, seed + 1).forEach(func(id : QuestionId) { selected.add(id) });
      pickN(fourMarkPool, fourMarkCount, seed + 2).forEach(func(id : QuestionId) { selected.add(id) });
      pickN(sixMarkPool, sixMarkCount, seed + 3).forEach(func(id : QuestionId) { selected.add(id) });
      pickN(eightMarkPool, eightMarkCount, seed + 4).forEach(func(id : QuestionId) { selected.add(id) });
      { variant = variantLabel; questions = selected.toArray() };
    });

    let mainVariant = if (variants.size() > 0) {
      variants[0].questions;
    } else {
      [];
    };

    let paper : GeneratedPaper = {
      id = nextPaperId;
      subjectId;
      subjectName;
      examDuration;
      totalMarks;
      questions = mainVariant;
      setVariants = variants;
      createdAt = now;
      teacherId = caller;
    };

    papers.add(nextPaperId, paper);
    nextPaperId += 1;
    ?paper;
  };

  public query ({ caller }) func getPapers() : async [GeneratedPaper] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view papers");
    };
    papers.values().toArray();
  };

  public query ({ caller }) func getPaper(id : PaperId) : async ?GeneratedPaper {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view papers");
    };
    papers.get(id);
  };

  public query ({ caller }) func getMyPapers() : async [GeneratedPaper] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view papers");
    };
    papers.values().toArray().filter(func(p : GeneratedPaper) : Bool {
      p.teacherId == caller
    });
  };

  public shared ({ caller }) func deletePaper(id : PaperId) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete papers");
    };
    switch (papers.get(id)) {
      case (null) { false };
      case (?p) {
        if (p.teacherId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own papers");
        };
        papers.remove(id);
        true;
      };
    };
  };

  // ── Utility ────────────────────────────────────────────────────────────────

  public query func getAllVariants() : async [Text] {
    ["A", "B", "C", "D", "E"];
  };
};
