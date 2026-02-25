import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PaperVariant {
    questions: Array<QuestionId>;
    variant: string;
}
export interface GeneratedPaper {
    id: PaperId;
    totalMarks: bigint;
    subjectName: string;
    createdAt: bigint;
    setVariants: Array<PaperVariant>;
    subjectId: SubjectId;
    teacherId: Principal;
    questions: Array<QuestionId>;
    examDuration: bigint;
}
export type PaperId = bigint;
export type QuestionId = bigint;
export interface Question {
    id: QuestionId;
    difficultyLevel: DifficultyLevel;
    correctAnswer?: string;
    questionText: string;
    subjectId: SubjectId;
    timestamp: bigint;
    category: QuestionCategory;
    options?: Array<string>;
}
export type SubjectId = string;
export interface UserProfile {
    name: string;
    designation?: string;
    department?: string;
}
export interface Subject {
    id: SubjectId;
    code: string;
    name: string;
}
export enum DifficultyLevel {
    easy = "easy",
    hard = "hard",
    medium = "medium"
}
export enum QuestionCategory {
    _2Marks = "_2Marks",
    _8Marks = "_8Marks",
    _6Marks = "_6Marks",
    _4Marks = "_4Marks",
    mcqOneMark = "mcqOneMark"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addQuestion(subjectId: SubjectId, category: QuestionCategory, questionText: string, options: Array<string> | null, correctAnswer: string | null, difficultyLevel: DifficultyLevel): Promise<QuestionId>;
    addQuestionsInBulk(questionsArray: Array<Question>): Promise<bigint>;
    addSubject(id: SubjectId, name: string, code: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deletePaper(id: PaperId): Promise<boolean>;
    deleteQuestion(id: QuestionId): Promise<boolean>;
    deleteSubject(id: SubjectId): Promise<boolean>;
    generatePaper(subjectId: SubjectId, examDuration: bigint, totalMarks: bigint, mcqCount: bigint, twoMarkCount: bigint, fourMarkCount: bigint, sixMarkCount: bigint, eightMarkCount: bigint): Promise<GeneratedPaper | null>;
    getAllVariants(): Promise<Array<string>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyPapers(): Promise<Array<GeneratedPaper>>;
    getPaper(id: PaperId): Promise<GeneratedPaper | null>;
    getPapers(): Promise<Array<GeneratedPaper>>;
    getQuestions(): Promise<Array<Question>>;
    getQuestionsBySubject(subjectId: SubjectId): Promise<Array<Question>>;
    getQuestionsBySubjectAndCategory(subjectId: SubjectId, category: QuestionCategory): Promise<Array<Question>>;
    getSubject(id: SubjectId): Promise<Subject | null>;
    getSubjects(): Promise<Array<Subject>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateQuestion(id: QuestionId, updatedQuestion: Question): Promise<boolean>;
    updateSubject(id: SubjectId, name: string, code: string): Promise<boolean>;
}
