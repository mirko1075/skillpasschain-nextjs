'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface AssessmentPageProps {
  assessmentId: string;
}

export function AssessmentPage({ assessmentId }: AssessmentPageProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(2700); // 45 minutes in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Mock assessment data
  const assessment = {
    id: assessmentId,
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of core JavaScript concepts',
    duration: 45,
    totalQuestions: 10,
    questions: [
      {
        id: 1,
        question: "What is the difference between 'let' and 'var' in JavaScript?",
        options: [
          "let is block-scoped, var is function-scoped",
          "let is function-scoped, var is block-scoped", 
          "There is no difference",
          "let cannot be redeclared, var can be"
        ],
        correctAnswer: 0
      },
      {
        id: 2,
        question: "Which method is used to add elements to the end of an array?",
        options: [
          "push()",
          "pop()",
          "shift()",
          "unshift()"
        ],
        correctAnswer: 0
      },
      {
        id: 3,
        question: "What does the '===' operator do in JavaScript?",
        options: [
          "Checks for equality without type conversion",
          "Checks for equality with type conversion",
          "Assigns a value",
          "Compares references"
        ],
        correctAnswer: 0
      }
    ]
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < assessment.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculate score based on correct answers
      let correct = 0;
      assessment.questions.forEach((question, index) => {
        const userAnswer = parseInt(answers[index]);
        if (userAnswer === question.correctAnswer) {
          correct++;
        }
      });
      
      const score = Math.round((correct / assessment.questions.length) * 100);
      
      // Here you would typically call your API to submit the assessment
      // await apiService.completeAssessment(assessmentId, score);
      
      toast({
        title: "Assessment completed!",
        description: `Your score: ${score}%`,
      });
      
      router.push('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit assessment.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentQuestion + 1) / assessment.questions.length) * 100;
  const currentQ = assessment.questions[currentQuestion];
  const answeredQuestions = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{assessment.title}</h1>
              <p className="text-gray-600">{assessment.description}</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center text-blue-600">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {currentQuestion + 1} of {assessment.questions.length}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                  {assessment.questions.map((_, index) => (
                    <Button
                      key={index}
                      variant={currentQuestion === index ? "default" : "outline"}
                      size="sm"
                      className={`relative ${
                        answers[index] !== undefined 
                          ? 'bg-green-100 border-green-300 text-green-700' 
                          : ''
                      }`}
                      onClick={() => setCurrentQuestion(index)}
                    >
                      {index + 1}
                      {answers[index] !== undefined && (
                        <CheckCircle className="w-3 h-3 absolute -top-1 -right-1 text-green-600" />
                      )}
                    </Button>
                  ))}
                </div>
                <div className="mt-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Answered:</span>
                    <span className="font-medium">{answeredQuestions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span className="font-medium">{assessment.questions.length - answeredQuestions}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  Question {currentQuestion + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-lg leading-relaxed">
                  {currentQ.question}
                </div>

                <RadioGroup 
                  value={answers[currentQuestion] || ""} 
                  onValueChange={handleAnswerChange}
                  className="space-y-4"
                >
                  {currentQ.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label 
                        htmlFor={`option-${index}`} 
                        className="flex-1 text-base leading-relaxed cursor-pointer p-3 rounded-lg hover:bg-gray-50"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex items-center justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {currentQuestion === assessment.questions.length - 1 ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                    >
                      {isSubmitting ? "Submitting..." : "Submit Assessment"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}