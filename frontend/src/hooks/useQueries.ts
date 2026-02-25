import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Question, QuestionCategory, DifficultyLevel, Subject } from '../backend';

// ── Subjects ──────────────────────────────────────────────────────────────────

export function useGetSubjects() {
  const { actor, isFetching } = useActor();
  return useQuery<Subject[]>({
    queryKey: ['subjects'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSubjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, code }: { name: string; code: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSubject(name, code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

export function useUpdateSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, code }: { id: string; name: string; code: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSubject(id, name, code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

export function useDeleteSubject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteSubject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });
}

// ── Questions ─────────────────────────────────────────────────────────────────

export function useGetAllQuestions() {
  const { actor, isFetching } = useActor();
  return useQuery<Question[]>({
    queryKey: ['questions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getQuestions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      subjectId: string;
      category: QuestionCategory;
      questionText: string;
      options?: string[];
      correctAnswer?: string;
      difficultyLevel: DifficultyLevel;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addQuestion(
        params.subjectId,
        params.category,
        params.questionText,
        params.options ?? null,
        params.correctAnswer ?? null,
        params.difficultyLevel
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}

export function useBulkUploadQuestions() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      questions: Array<{
        subjectId: string;
        category: QuestionCategory;
        questionText: string;
        options?: string[];
        correctAnswer?: string;
        difficultyLevel: DifficultyLevel;
      }>
    ) => {
      if (!actor) throw new Error('Actor not available');
      const now = BigInt(Date.now()) * BigInt(1_000_000);
      const questionsWithIds: Question[] = questions.map((q, idx) => ({
        id: BigInt(Date.now() + idx),
        subjectId: q.subjectId,
        category: q.category,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        difficultyLevel: q.difficultyLevel,
        timestamp: now + BigInt(idx),
      }));
      return actor.addQuestionsInBulk(questionsWithIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}

export function useUpdateQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updatedQuestion }: { id: bigint; updatedQuestion: Question }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateQuestion(id, updatedQuestion);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}

export function useDeleteQuestion() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteQuestion(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}

// ── Papers ────────────────────────────────────────────────────────────────────

export function useGetMyPapers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['myPapers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyPapers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPaper(id?: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ['paper', String(id)],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getPaper(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useGeneratePaper() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      subjectId: string;
      examDuration: bigint;
      totalMarks: bigint;
      mcqCount: bigint;
      twoMarkCount: bigint;
      fourMarkCount: bigint;
      sixMarkCount: bigint;
      eightMarkCount: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.generatePaper(
        params.subjectId,
        params.examDuration,
        params.totalMarks,
        params.mcqCount,
        params.twoMarkCount,
        params.fourMarkCount,
        params.sixMarkCount,
        params.eightMarkCount
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPapers'] });
    },
  });
}
