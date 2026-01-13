import { useEffect, useState } from 'react';
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
    const [completedCourses, setCompletedCourses] = useState<any[]>([]);

    useEffect(() => {
        const completed = JSON.parse(localStorage.getItem("completedCourses") || "[]");
        setCompletedCourses(completed);
    }, []);
    return (
        <div className="page course-list-page">
            <header className="header">
                <div className="header-content">
                    <h1>📚 Learning Platform</h1>
                    <p>Expand your knowledge with verified attention-based courses</p>
                </div>
            </header>

            <main className="container">
                {/* Completed Courses Section */}
                {completedCourses.length > 0 && (
                    <div style={{ marginBottom: '40px', padding: '20px', background: 'linear-gradient(135deg, #1a3a1a 0%, #2d5a2d 100%)', border: '2px solid #4a9d4a', borderRadius: '12px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#4ade80', marginBottom: '15px', margin: 0 }}>🏆 Your Completed Courses</h2>
                        <p style={{ fontSize: '14px', color: '#86efac', marginBottom: '20px', margin: 0 }}>Verified with proof of attention</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                            {completedCourses.map((course, index) => (
                                <div
                                    key={index}
                                    style={{
                                        background: '#0a0a0a',
                                        border: '1px solid #4a9d4a',
                                        borderRadius: '8px',
                                        padding: '15px',
                                        boxShadow: '0 4px 12px rgba(74, 157, 74, 0.2)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div>
                                            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#4ade80', margin: 0, marginBottom: '4px' }}>{course.courseName}</h3>
                                            <p style={{ fontSize: '12px', color: '#22c55e', margin: 0 }}>✅ Completed</p>
                                        </div>
                                        <div style={{ fontSize: '24px' }}>✨</div>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#bbb', lineHeight: '1.6' }}>
                                        <div style={{ marginBottom: '8px' }}>
                                            <span style={{ color: '#999' }}>Score:</span> <span style={{ color: '#4ade80', fontWeight: '600' }}>{Math.round(course.attentionScore)}/100</span>
                                        </div>
                                        <div style={{ marginBottom: '8px' }}>
                                            <span style={{ color: '#999' }}>Date:</span> <span style={{ color: '#86efac' }}>{new Date(course.completedAt).toLocaleDateString()}</span>
                                        </div>
                                        {course.blockchainTxHash && (
                                            <div>
                                                <span style={{ color: '#999' }}>On-Chain:</span> <span style={{ color: '#22c55e', fontSize: '11px', wordBreak: 'break-all' }}>✓ Verified</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#ddd', marginBottom: '20px' }}>Continue Learning</h2>
                <div className="courses-grid">
                    {courses.map(course => (
                        <div
                            key={course.id}
                            className="course-card"
                            onClick={() => onCourseClick(course)}
                        >
                            <div className="course-image">
                                <img src={course.thumbnail} alt={course.title} />
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
