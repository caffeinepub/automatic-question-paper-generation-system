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

  // Get all questions (fetch from all subjects and categories)
  const useGetAllQuestions = () => {
    return useQuery<Question[]>({
      queryKey: ['allQuestions'],
      queryFn: async () => {
        if (!actor) return [];
        
        const stored = localStorage.getItem('subjects');
        const subjects = stored ? JSON.parse(stored) : [];
        
        const categories = [
          QuestionCategory._2Marks,
          QuestionCategory._4Marks,
          QuestionCategory.mcq,
          QuestionCategory._6Marks,
          QuestionCategory._8Marks,
        ];

        const allQuestions: Question[] = [];
        
        for (const subject of subjects) {
          for (const category of categories) {
            const questions = await actor.getQuestionsBySubjectAndCategory(subject.id, category);
            allQuestions.push(...questions);
          }
        }
        
        return allQuestions;
      },
      enabled: !!actor && !isFetching,
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
        if (!actor) throw new Error('Actor not initialized');
        await actor.addQuestion(
          data.subjectId,
          data.category,
          data.questionText,
          data.options,
          data.correctAnswer,
          data.difficultyLevel
        );
      },
      onSuccess: () => {
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
    useGetGeneratedPapersCount,
  };
}
