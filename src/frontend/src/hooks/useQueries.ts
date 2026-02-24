import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { DifficultyLevel, QuestionCategory, type Question } from '../backend';

export function useQueries() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();

  // Get all subjects from localStorage (since backend doesn't have getAllSubjects)
  const useGetAllSubjects = () => {
    return useQuery({
      queryKey: ['subjects'],
      queryFn: async () => {
        const stored = localStorage.getItem('subjects');
        if (stored) {
          return JSON.parse(stored);
        }
        // Initialize with default engineering subjects
        const defaultSubjects = [
          { id: 'DM101', name: 'Discrete Mathematics', code: 'DM' },
          { id: 'OS101', name: 'Operating System', code: 'OS' },
          { id: 'MP101', name: 'Microprocessor', code: 'MP' },
          { id: 'DS101', name: 'Data Structures', code: 'DS' },
          { id: 'CN101', name: 'Computer Networks', code: 'CN' },
        ];
        localStorage.setItem('subjects', JSON.stringify(defaultSubjects));
        return defaultSubjects;
      },
      enabled: true,
    });
  };

  // Add subject
  const useAddSubject = () => {
    return useMutation({
      mutationFn: async (data: { id: string; name: string; code: string }) => {
        if (!actor) throw new Error('Actor not initialized');
        await actor.addSubject(data.id, data.name, data.code);
        
        // Also store in localStorage
        const stored = localStorage.getItem('subjects');
        const subjects = stored ? JSON.parse(stored) : [];
        subjects.push(data);
        localStorage.setItem('subjects', JSON.stringify(subjects));
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['subjects'] });
      },
    });
  };

  // Get all questions using the backend's getQuestions method
  const useGetAllQuestions = () => {
    console.log('🔍 useGetAllQuestions hook initialized');
    
    return useQuery<Question[]>({
      queryKey: ['allQuestions'],
      queryFn: async () => {
        console.log('📡 useGetAllQuestions queryFn called');
        console.log('Actor status:', { 
          actorExists: !!actor, 
          isFetching,
          actorType: actor ? typeof actor : 'undefined'
        });

        if (!actor) {
          console.warn('⚠️ Actor not available, returning empty array');
          return [];
        }

        try {
          console.log('🚀 Calling actor.getQuestions()...');
          const questions = await actor.getQuestions();
          console.log('✅ Questions received from backend:', {
            count: questions.length,
            sample: questions.length > 0 ? {
              firstQuestion: {
                id: questions[0].id.toString(),
                category: questions[0].category,
                subjectId: questions[0].subjectId,
                questionText: questions[0].questionText.substring(0, 50) + '...'
              }
            } : 'No questions available'
          });
          return questions;
        } catch (error) {
          console.error('❌ Error fetching questions from backend:', error);
          console.error('Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace',
            errorType: typeof error
          });
          throw error;
        }
      },
      enabled: !!actor && !isFetching,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
  };

  // Add question
  const useAddQuestion = () => {
    return useMutation({
      mutationFn: async (data: {
        subjectId: string;
        category: QuestionCategory;
        questionText: string;
        options: string[] | null;
        correctAnswer: string | null;
        difficultyLevel: DifficultyLevel;
      }) => {
        console.log('📝 Adding single question:', data);
        if (!actor) throw new Error('Actor not initialized');
        await actor.addQuestion(
          data.subjectId,
          data.category,
          data.questionText,
          data.options,
          data.correctAnswer,
          data.difficultyLevel
        );
        console.log('✅ Question added successfully');
      },
      onSuccess: () => {
        console.log('🔄 Invalidating allQuestions query after adding question');
        queryClient.invalidateQueries({ queryKey: ['allQuestions'] });
      },
    });
  };

  // Bulk upload questions
  const useBulkUploadQuestions = () => {
    return useMutation({
      mutationFn: async (questions: Omit<Question, 'id' | 'timestamp'>[]) => {
        console.log('📦 Bulk uploading questions:', { count: questions.length });
        if (!actor) throw new Error('Actor not initialized');
        
        // Convert questions to the format expected by backend
        // Generate unique temporary IDs for each question
        const questionsWithIds: Question[] = questions.map((q, index) => ({
          ...q,
          id: BigInt(Date.now() * 1000 + index), // Unique temporary ID
          timestamp: BigInt(Date.now()),
        }));
        
        console.log('🚀 Calling actor.addQuestionsInBulk with', questionsWithIds.length, 'questions');
        const count = await actor.addQuestionsInBulk(questionsWithIds);
        console.log('✅ Bulk upload completed. Questions added:', Number(count));
        return Number(count);
      },
      onSuccess: (count) => {
        console.log('🔄 Invalidating allQuestions query after bulk upload. Count:', count);
        // Invalidate queries to refetch all questions
        queryClient.invalidateQueries({ queryKey: ['allQuestions'] });
      },
    });
  };

  // Get generated papers count
  const useGetGeneratedPapersCount = () => {
    const papers = JSON.parse(localStorage.getItem('generatedPapers') || '[]');
    return papers.length;
  };

  return {
    useGetAllSubjects,
    useAddSubject,
    useGetAllQuestions,
    useAddQuestion,
    useBulkUploadQuestions,
    useGetGeneratedPapersCount,
  };
}
