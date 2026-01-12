import '../styles/pages.css';

interface Course {
    id: string;
    title: string;
    description: string;
    duration: number;
    thumbnail: string;
    videoUrl: string;
    instructor: string;
}

interface CourseListProps {
    courses: Course[];
    onCourseClick: (course: Course) => void;
}

export default function CourseList({ courses, onCourseClick }: CourseListProps) {
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        return `${mins} min`;
    };

    return (
        <div className="page course-list-page">
            <header className="header">
                <div className="header-content">
                    <h1>📚 Learning Platform</h1>
                    <p>Expand your knowledge with verified attention-based courses</p>
                </div>
            </header>

            <main className="container">
                <div className="courses-grid">
                    {courses.map(course => (
                        <div
                            key={course.id}
                            className="course-card"
                            onClick={() => onCourseClick(course)}
                        >
                            <div className="course-image">
                                <img src={course.thumbnail} alt={course.title} />
                                <div className="duration-badge">{formatDuration(course.duration)}</div>
                            </div>
                            <div className="course-info">
                                <h3>{course.title}</h3>
                                <p>{course.description}</p>
                                <div className="course-meta">
                                    <span className="instructor">👨‍🏫 {course.instructor}</span>
                                </div>
                                <button className="btn-primary">Start Learning</button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
