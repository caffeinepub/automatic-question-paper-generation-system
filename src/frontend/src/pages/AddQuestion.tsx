import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useQueries } from '../hooks/useQueries';
import { toast } from 'sonner';
import { DifficultyLevel, QuestionCategory } from '../backend';
import { parseCSV } from '../utils/csvParser';
import { parseJSON } from '../utils/jsonParser';
import { downloadCSVTemplate } from '../utils/csvTemplate';
import { Upload, Download, AlertCircle, Loader2 } from 'lucide-react';

export default function AddQuestion() {
  const { useGetAllSubjects, useAddQuestion, useBulkUploadQuestions } = useQueries();
  const { data: subjects = [] } = useGetAllSubjects();
  const addQuestionMutation = useAddQuestion();
  const bulkUploadMutation = useBulkUploadQuestions();

  const [formData, setFormData] = useState({
    subjectId: '',
    category: '' as QuestionCategory | '',
    questionText: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: '',
    difficultyLevel: '' as DifficultyLevel | ''
  });

  const [bulkUploadFile, setBulkUploadFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ row?: number; index?: number; message: string }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subjectId || !formData.category || !formData.questionText || !formData.difficultyLevel) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.category === QuestionCategory.mcqOneMark) {
      if (!formData.option1 || !formData.option2 || !formData.option3 || !formData.option4 || !formData.correctAnswer) {
        toast.error('Please fill in all MCQ options and select the correct answer');
        return;
      }
    }

    const options = formData.category === QuestionCategory.mcqOneMark 
      ? [formData.option1, formData.option2, formData.option3, formData.option4]
      : null;

    const correctAnswer = formData.category === QuestionCategory.mcqOneMark 
      ? formData.correctAnswer 
      : null;

    try {
      await addQuestionMutation.mutateAsync({
        subjectId: formData.subjectId,
        category: formData.category,
        questionText: formData.questionText,
        options,
        correctAnswer,
        difficultyLevel: formData.difficultyLevel
      });

      toast.success('Question added successfully!');
      
      // Reset form
      setFormData({
        subjectId: '',
        category: '' as QuestionCategory | '',
        questionText: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctAnswer: '',
        difficultyLevel: '' as DifficultyLevel | ''
      });
    } catch (error) {
      toast.error('Failed to add question');
      console.error(error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const validExtensions = ['csv', 'json'];
      
      if (!fileExtension || !validExtensions.includes(fileExtension)) {
        toast.error('Invalid file format. Please use .csv or .json');
        e.target.value = '';
        return;
      }
      
      setBulkUploadFile(file);
      setValidationErrors([]);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkUploadFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setValidationErrors([]);

    try {
      const fileText = await bulkUploadFile.text();
      const fileExtension = bulkUploadFile.name.split('.').pop()?.toLowerCase();

      let parseResult: { validQuestions: any[]; errors: any[] };

      if (fileExtension === 'csv') {
        parseResult = parseCSV(fileText);
      } else if (fileExtension === 'json') {
        parseResult = parseJSON(fileText);
      } else {
        toast.error('Unsupported file format. Please use .csv or .json');
        return;
      }

      if (parseResult.errors.length > 0) {
        setValidationErrors(parseResult.errors);
        toast.error(`Found ${parseResult.errors.length} validation error(s). Please fix them and try again.`);
        return;
      }

      if (parseResult.validQuestions.length === 0) {
        toast.error('No valid questions found in the file');
        return;
      }

      // Upload valid questions
      const count = await bulkUploadMutation.mutateAsync(parseResult.validQuestions);
      
      toast.success(`File uploaded successfully! ${count} question(s) have been added to the database.`);
      
      // Reset file input
      setBulkUploadFile(null);
      setValidationErrors([]);
      const fileInput = document.getElementById('bulk-upload-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      toast.error('Failed to upload questions');
      console.error(error);
    }
  };

  const isMCQ = formData.category === QuestionCategory.mcqOneMark;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Single Question Form */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-navy">Add New Question</CardTitle>
          <CardDescription>Fill in the details to add a question to the database</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select value={formData.subjectId} onValueChange={(value) => setFormData({ ...formData, subjectId: value })}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Question Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as QuestionCategory })}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QuestionCategory._2Marks}>2 Marks</SelectItem>
                  <SelectItem value={QuestionCategory._4Marks}>4 Marks</SelectItem>
                  <SelectItem value={QuestionCategory.mcqOneMark}>MCQ (1 Mark)</SelectItem>
                  <SelectItem value={QuestionCategory._6Marks}>6 Marks</SelectItem>
                  <SelectItem value={QuestionCategory._8Marks}>8 Marks</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionText">Question Text *</Label>
              <Textarea
                id="questionText"
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                placeholder="Enter the question text"
                rows={4}
                className="resize-none"
              />
            </div>

            {isMCQ && (
              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <h3 className="font-semibold text-navy">MCQ Options</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="option1">Option 1 *</Label>
                  <Input
                    id="option1"
                    value={formData.option1}
                    onChange={(e) => setFormData({ ...formData, option1: e.target.value })}
                    placeholder="Enter option 1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="option2">Option 2 *</Label>
                  <Input
                    id="option2"
                    value={formData.option2}
                    onChange={(e) => setFormData({ ...formData, option2: e.target.value })}
                    placeholder="Enter option 2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="option3">Option 3 *</Label>
                  <Input
                    id="option3"
                    value={formData.option3}
                    onChange={(e) => setFormData({ ...formData, option3: e.target.value })}
                    placeholder="Enter option 3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="option4">Option 4 *</Label>
                  <Input
                    id="option4"
                    value={formData.option4}
                    onChange={(e) => setFormData({ ...formData, option4: e.target.value })}
                    placeholder="Enter option 4"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correctAnswer">Correct Answer *</Label>
                  <Select value={formData.correctAnswer} onValueChange={(value) => setFormData({ ...formData, correctAnswer: value })}>
                    <SelectTrigger id="correctAnswer">
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.option1 && <SelectItem value={formData.option1}>{formData.option1}</SelectItem>}
                      {formData.option2 && <SelectItem value={formData.option2}>{formData.option2}</SelectItem>}
                      {formData.option3 && <SelectItem value={formData.option3}>{formData.option3}</SelectItem>}
                      {formData.option4 && <SelectItem value={formData.option4}>{formData.option4}</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level *</Label>
              <Select value={formData.difficultyLevel} onValueChange={(value) => setFormData({ ...formData, difficultyLevel: value as DifficultyLevel })}>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={DifficultyLevel.easy}>Easy</SelectItem>
                  <SelectItem value={DifficultyLevel.medium}>Medium</SelectItem>
                  <SelectItem value={DifficultyLevel.hard}>Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-navy hover:bg-navy/90"
              disabled={addQuestionMutation.isPending}
            >
              {addQuestionMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Question...
                </>
              ) : (
                'Add Question'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Bulk Upload Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-navy">Bulk Upload Questions</CardTitle>
          <CardDescription>Upload multiple questions at once using CSV or JSON format</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={downloadCSVTemplate}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Download CSV Template
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-upload-file">Upload File (CSV or JSON)</Label>
            <Input
              id="bulk-upload-file"
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              disabled={bulkUploadMutation.isPending}
            />
            {bulkUploadFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {bulkUploadFile.name}
              </p>
            )}
          </div>

          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold">Validation Errors:</p>
                  <ul className="list-disc list-inside text-sm">
                    {validationErrors.slice(0, 5).map((error, idx) => (
                      <li key={idx}>
                        {error.row ? `Row ${error.row}` : error.index ? `Entry ${error.index}` : 'Error'}: {error.message}
                      </li>
                    ))}
                    {validationErrors.length > 5 && (
                      <li>... and {validationErrors.length - 5} more error(s)</li>
                    )}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleBulkUpload}
            className="w-full bg-navy hover:bg-navy/90"
            disabled={!bulkUploadFile || bulkUploadMutation.isPending}
          >
            {bulkUploadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Questions
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
