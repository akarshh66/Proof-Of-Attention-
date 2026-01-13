import { CourseQuiz } from '../types/quiz.js';

// Empty quiz data - quiz system removed
export const courseQuizzes: CourseQuiz[] = [
    {
        courseId: 'course_001',
        title: 'Introduction to React - Quiz',
        questions: [
            {
                id: 'q1_react_001',
                question: 'What is a React component?',
                options: [
                    'A reusable piece of UI logic',
                    'A CSS framework',
                    'A database model',
                    'A state management tool'
                ],
                correctAnswer: 0,
                difficulty: 'easy',
                timeOffset: 120, // 2 minutes
            },
            {
                id: 'q1_react_002',
                question: 'Which hook allows you to manage component state?',
                options: [
                    'useEffect',
                    'useState',
                    'useContext',
                    'useReducer'
                ],
                correctAnswer: 1,
                difficulty: 'easy',
                timeOffset: 300, // 5 minutes
            },
            {
                id: 'q1_react_003',
                question: 'What is the purpose of the useEffect hook?',
                options: [
                    'To create side effects',
                    'To handle component lifecycle and side effects',
                    'To manage global state',
                    'To optimize component performance'
                ],
                correctAnswer: 1,
                difficulty: 'medium',
                timeOffset: 480, // 8 minutes
            },
        ],
    },
    {
        courseId: 'course_002',
        title: 'Advanced TypeScript - Quiz',
        questions: [
            {
                id: 'q2_ts_001',
                question: 'What is a generic type in TypeScript?',
                options: [
                    'A type that only works with numbers',
                    'A reusable type that works with any data type',
                    'A type that requires inheritance',
                    'A depreciated TypeScript feature'
                ],
                correctAnswer: 1,
                difficulty: 'easy',
                timeOffset: 180, // 3 minutes
            },
            {
                id: 'q2_ts_002',
                question: 'What does "keyof" operator do?',
                options: [
                    'Creates new object keys',
                    'Gets all keys of an object type as a union',
                    'Removes keys from an object',
                    'Encrypts object keys'
                ],
                correctAnswer: 1,
                difficulty: 'medium',
                timeOffset: 420, // 7 minutes
            },
            {
                id: 'q2_ts_003',
                question: 'What is a conditional type in TypeScript?',
                options: [
                    'A type that depends on a condition',
                    'A type used only in if statements',
                    'A type that is deprecated',
                    'A type for boolean values'
                ],
                correctAnswer: 0,
                difficulty: 'hard',
                timeOffset: 600, // 10 minutes
            },
        ],
    },
    {
        courseId: 'course_004',
        title: 'Blockchain Fundamentals - Quiz',
        questions: [
            {
                id: 'q4_bc_001',
                question: 'What is blockchain?',
                options: [
                    'A social media platform',
                    'A distributed ledger of transactions recorded in blocks',
                    'A cryptocurrency exchange',
                    'A database backup system'
                ],
                correctAnswer: 1,
                difficulty: 'easy',
                timeOffset: 150, // 2.5 minutes
            },
            {
                id: 'q4_bc_002',
                question: 'What is a smart contract?',
                options: [
                    'A traditional written agreement',
                    'A legal document stored on blockchain',
                    'Self-executing code on the blockchain',
                    'A cryptocurrency wallet'
                ],
                correctAnswer: 2,
                difficulty: 'medium',
                timeOffset: 420, // 7 minutes
            },
            {
                id: 'q4_bc_003',
                question: 'What consensus mechanism does Bitcoin use?',
                options: [
                    'Proof of Stake',
                    'Proof of Authority',
                    'Proof of Work',
                    'Proof of History'
                ],
                correctAnswer: 2,
                difficulty: 'medium',
                timeOffset: 600, // 10 minutes
            },
        ],
    },
];

export function getQuizForCourse(courseId: string): CourseQuiz | undefined {
    return courseQuizzes.find(q => q.courseId === courseId);
}

export function getQuestionsForCourse(courseId: string): any[] {
    const quiz = getQuizForCourse(courseId);
    return quiz ? quiz.questions : [];
}
