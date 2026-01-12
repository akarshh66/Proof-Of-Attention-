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

interface CourseDetailsProps {
    course: Course;
    onStart: () => void;
    onBack: () => void;
}

export default function CourseDetails({ course, onStart, onBack }: CourseDetailsProps) {
    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    return (
        <div className="page course-details-page">
            <button className="btn-back" onClick={onBack}>← Back to Courses</button>

            <div className="container">
                <div className="course-header">
                    <img src={course.thumbnail} alt={course.title} className="course-hero" />

                    <div className="course-header-content">
                        <h1>{course.title}</h1>
                        <p className="course-description">{course.description}</p>

                        <div className="course-stats">
                            <div className="stat">
                                <span className="stat-label">Duration</span>
                                <span className="stat-value">{formatDuration(course.duration)}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Instructor</span>
                                <span className="stat-value">{course.instructor}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Verified by</span>
                                <span className="stat-value">Proof of Attention ✓</span>
                            </div>
                        </div>

                        <div className="course-features">
                            <h3>What You'll Learn</h3>
                            <ul>
                                <li>✓ Core concepts and fundamentals</li>
                                <li>✓ Practical hands-on experience</li>
                                <li>✓ Real-world applications</li>
                                <li>✓ Certificate of completion with verified attention</li>
                            </ul>
                        </div>

                        <button className="btn-primary btn-large" onClick={onStart}>
                            Start Course with Verified Attention
                        </button>

                        <div className="info-box">
                            <p>
                                <strong>ℹ️ Privacy Notice:</strong> Your attention metrics will be encrypted and verified using Proof of Attention.
                                Your raw attention data remains private.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
