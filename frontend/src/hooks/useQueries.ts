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
    mutationFn: async ({ id, name, code }: { id: string; name: string; code: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addSubject(id, name, code);
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
    mutationFn: async ({
      subjectId,
      category,
      questionText,
      options,
      correctAnswer,
      difficultyLevel,
    }: {
      subjectId: string;
      category: QuestionCategory;
      questionText: string;
      options: string[] | null;
      correctAnswer: string | null;
      difficultyLevel: DifficultyLevel;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addQuestion(subjectId, category, questionText, options, correctAnswer, difficultyLevel);
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

export function useBulkUploadQuestions() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (questions: Question[]) => {
      if (!actor) throw new Error('Actor not available');
      const count = await actor.addQuestionsInBulk(questions);
      return Number(count);
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

export function useGeneratePaper() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subjectId,
      examDuration,
      totalMarks,
      mcqCount,
      twoMarkCount,
      fourMarkCount,
      sixMarkCount,
      eightMarkCount,
    }: {
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
        subjectId,
        examDuration,
        totalMarks,
        mcqCount,
        twoMarkCount,
        fourMarkCount,
        sixMarkCount,
        eightMarkCount,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myPapers'] });
    },
  });
}

// ── User Profile ──────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: { name: string; department?: string; designation?: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
