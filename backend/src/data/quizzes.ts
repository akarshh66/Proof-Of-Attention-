export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number; // Index of correct option
    explanation: string;
}

export interface CourseQuiz {
    courseId: string;
    courseName: string;
    questions: QuizQuestion[];
}

export const courseQuizzes: CourseQuiz[] = [
    {
        courseId: 'course_001',
        courseName: 'Introduction to React',
        questions: [
            {
                id: 'q1',
                question: 'What is React primarily used for?',
                options: [
                    'Managing databases',
                    'Building user interfaces',
                    'Writing server-side APIs',
                    'Handling network requests'
                ],
                correctAnswer: 1,
                explanation: 'React is a JavaScript library primarily used for building dynamic and interactive user interfaces.'
            },
            {
                id: 'q2',
                question: 'Which of the following is used to pass data from a parent component to a child component in React?',
                options: [
                    'State',
                    'setState',
                    'Props',
                    'Context'
                ],
                correctAnswer: 2,
                explanation: 'Props are used to pass data from parent to child components, allowing components to communicate.'
            },
            {
                id: 'q3',
                question: 'What does JSX stand for in React?',
                options: [
                    'JavaScript XML',
                    'Java Syntax Extension',
                    'JavaScript Extension',
                    'JSON XML'
                ],
                correctAnswer: 0,
                explanation: 'JSX stands for JavaScript XML and allows you to write HTML-like syntax directly in JavaScript.'
            },
            {
                id: 'q4',
                question: 'Which React Hook is used to manage state in a functional component?',
                options: [
                    'useEffect',
                    'useRef',
                    'useState',
                    'useContext'
                ],
                correctAnswer: 2,
                explanation: 'useState is the React Hook used to manage state in functional components.'
            },
            {
                id: 'q5',
                question: 'What is the purpose of the `key` prop in React lists?',
                options: [
                    'To uniquely identify elements for efficient rendering',
                    'To store component state',
                    'To encrypt list items',
                    'To improve CSS styling'
                ],
                correctAnswer: 0,
                explanation: 'The key prop helps React identify which elements have changed and is crucial for list performance and correctness.'
            }
        ]
    },
    {
        courseId: 'course_002',
        courseName: 'Advanced TypeScript',
        questions: [
            {
                id: 'q1',
                question: 'What is the main purpose of TypeScript?',
                options: [
                    'To style web pages',
                    'To add static typing to JavaScript',
                    'To replace HTML',
                    'To manage databases'
                ],
                correctAnswer: 1,
                explanation: 'TypeScript adds static typing to JavaScript, helping catch errors during development.'
            },
            {
                id: 'q2',
                question: 'Which of the following is a valid TypeScript type?',
                options: [
                    'number',
                    'integer',
                    'float',
                    'double'
                ],
                correctAnswer: 0,
                explanation: 'number is a valid TypeScript primitive type. integer, float, and double are not TypeScript types.'
            },
            {
                id: 'q3',
                question: 'Which keyword is used to define an interface in TypeScript?',
                options: [
                    'type',
                    'class',
                    'interface',
                    'implements'
                ],
                correctAnswer: 2,
                explanation: 'The interface keyword is used to define interfaces in TypeScript for describing object shapes.'
            },
            {
                id: 'q4',
                question: 'What does the `any` type indicate in TypeScript?',
                options: [
                    'The variable can only store numbers',
                    'The variable must be a string',
                    'Type checking is disabled for this variable',
                    'The variable is read-only'
                ],
                correctAnswer: 2,
                explanation: 'The any type disables type checking for that variable, allowing any value to be assigned.'
            },
            {
                id: 'q5',
                question: 'Which TypeScript feature allows combining multiple types into one?',
                options: [
                    'Interfaces',
                    'Enums',
                    'Union Types',
                    'Tuples'
                ],
                correctAnswer: 2,
                explanation: 'Union Types allow combining multiple types into one, creating flexible type definitions like string | number.'
            }
        ]
    },
    {
        courseId: 'course_003',
        courseName: 'Blockchain Fundamentals',
        questions: [
            {
                id: 'q1',
                question: 'What is a blockchain?',
                options: [
                    'A centralized database managed by a single authority',
                    'A distributed ledger maintained across multiple nodes',
                    'A type of cloud storage service',
                    'A programming language'
                ],
                correctAnswer: 1,
                explanation: 'A blockchain is a distributed ledger where multiple nodes maintain copies of the same data, ensuring no single point of control.'
            },
            {
                id: 'q2',
                question: 'Which feature of blockchain ensures that data cannot be easily altered?',
                options: [
                    'Scalability',
                    'Immutability',
                    'Latency',
                    'Compression'
                ],
                correctAnswer: 1,
                explanation: 'Immutability ensures that once data is recorded on a blockchain, it cannot be easily changed or deleted.'
            },
            {
                id: 'q3',
                question: 'What is a smart contract?',
                options: [
                    'A legal contract written by lawyers',
                    'A digital agreement stored off-chain',
                    'Self-executing code that runs on a blockchain',
                    'An encrypted PDF document'
                ],
                correctAnswer: 2,
                explanation: 'Smart contracts are self-executing programs deployed on blockchain networks that automatically execute when conditions are met.'
            },
            {
                id: 'q4',
                question: 'Which consensus mechanism is used by Bitcoin?',
                options: [
                    'Proof of Stake (PoS)',
                    'Proof of Authority (PoA)',
                    'Proof of Work (PoW)',
                    'Delegated Proof of Stake (DPoS)'
                ],
                correctAnswer: 2,
                explanation: 'Bitcoin uses Proof of Work, where miners solve complex mathematical problems to validate transactions.'
            },
            {
                id: 'q5',
                question: 'What does decentralization in blockchain mean?',
                options: [
                    'Data is controlled by a single server',
                    'Only governments can access the network',
                    'No single entity has full control over the network',
                    'Transactions are processed offline'
                ],
                correctAnswer: 2,
                explanation: 'Decentralization means that network control is distributed among many participants, with no single entity having full authority.'
            }
        ]
    }
];
