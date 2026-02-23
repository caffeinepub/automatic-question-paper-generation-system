import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export enum DifficultyLevel {
    easy = "easy",
    hard = "hard",
    medium = "medium"
}
export enum QuestionCategory {
    mcq = "mcq",
    _2Marks = "_2Marks",
    _8Marks = "_8Marks",
    _6Marks = "_6Marks",
    _4Marks = "_4Marks"
}
export interface backendInterface {
    addQuestion(subjectId: SubjectId, category: QuestionCategory, questionText: string, options: Array<string> | null, correctAnswer: string | null, difficultyLevel: DifficultyLevel): Promise<void>;
    addSubject(id: SubjectId, name: string, code: string): Promise<void>;
    getAllVariants(): Promise<Array<string>>;
    getQuestionsBySubjectAndCategory(subjectId: SubjectId, category: QuestionCategory): Promise<Array<Question>>;
}
