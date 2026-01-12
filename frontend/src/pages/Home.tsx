import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        userId: "",
        courseId: "",
        lessonId: "",
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.userId.trim()) {
            newErrors.userId = "User ID is required";
        }
        if (!formData.courseId.trim()) {
            newErrors.courseId = "Course ID is required";
        }
        if (!formData.lessonId.trim()) {
            newErrors.lessonId = "Lesson ID is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        // Generate unique sessionId
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Store session data
        const sessionData = {
            sessionId,
            userId: formData.userId,
            courseId: formData.courseId,
            lessonId: formData.lessonId,
            startTime: new Date().toISOString(),
        };

        sessionStorage.setItem("poaSession", JSON.stringify(sessionData));

        // Redirect to lesson page
        setTimeout(() => {
            navigate("/lesson");
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">POA</h1>
                            <p className="text-sm text-gray-600 mt-1">Proof of Attention</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">
                                Verify your attention with real-time engagement tracking
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Info */}
                    <div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-6">
                            Start Your Attention Verification
                        </h2>

                        <p className="text-lg text-gray-700 mb-8">
                            POA is a privacy-preserving system that verifies real learner attention using measurable engagement signals before allowing lesson completion.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-600 text-white">
                                        ✓
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Real-Time Tracking
                                    </h3>
                                    <p className="mt-2 text-gray-600">
                                        We track active time, tab focus, and user activity—nothing more.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-600 text-white">
                                        🔐
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Privacy-Preserving
                                    </h3>
                                    <p className="mt-2 text-gray-600">
                                        Your attention data is encrypted and never publicly exposed.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-600 text-white">
                                        ⛓️
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Blockchain-Verified
                                    </h3>
                                    <p className="mt-2 text-gray-600">
                                        Proofs are anchored on blockchain for immutable verification.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="bg-white rounded-lg shadow-xl p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Enter Your Details
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Provide your information to begin the attention verification session.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* User ID */}
                            <div>
                                <label
                                    htmlFor="userId"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    User ID
                                </label>
                                <input
                                    type="text"
                                    id="userId"
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleInputChange}
                                    placeholder="e.g., user@example.com or USER123"
                                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${errors.userId
                                            ? "border-red-500 bg-red-50"
                                            : "border-gray-300 bg-white focus:border-blue-500 focus:bg-white"
                                        } focus:outline-none`}
                                />
                                {errors.userId && (
                                    <p className="text-red-600 text-sm mt-1">{errors.userId}</p>
                                )}
                            </div>

                            {/* Course ID */}
                            <div>
                                <label
                                    htmlFor="courseId"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Course ID
                                </label>
                                <input
                                    type="text"
                                    id="courseId"
                                    name="courseId"
                                    value={formData.courseId}
                                    onChange={handleInputChange}
                                    placeholder="e.g., COURSE101 or AI-ML-001"
                                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${errors.courseId
                                            ? "border-red-500 bg-red-50"
                                            : "border-gray-300 bg-white focus:border-blue-500 focus:bg-white"
                                        } focus:outline-none`}
                                />
                                {errors.courseId && (
                                    <p className="text-red-600 text-sm mt-1">{errors.courseId}</p>
                                )}
                            </div>

                            {/* Lesson ID */}
                            <div>
                                <label
                                    htmlFor="lessonId"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Lesson ID
                                </label>
                                <input
                                    type="text"
                                    id="lessonId"
                                    name="lessonId"
                                    value={formData.lessonId}
                                    onChange={handleInputChange}
                                    placeholder="e.g., LESSON5 or L-001"
                                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${errors.lessonId
                                            ? "border-red-500 bg-red-50"
                                            : "border-gray-300 bg-white focus:border-blue-500 focus:bg-white"
                                        } focus:outline-none`}
                                />
                                {errors.lessonId && (
                                    <p className="text-red-600 text-sm mt-1">{errors.lessonId}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 mt-8 ${isLoading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Starting Session...
                                    </span>
                                ) : (
                                    "Start Verification Session"
                                )}
                            </button>
                        </form>

                        {/* Info Box */}
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-900">
                                <strong>💡 Tip:</strong> Your session will be created securely, and you'll be taken to the lesson page where attention tracking begins.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900 text-white mt-20">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <h4 className="font-semibold mb-4">About POA</h4>
                            <p className="text-gray-400 text-sm">
                                Proof of Attention verifies real learner engagement using privacy-preserving computation and blockchain verification.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Technology</h4>
                            <ul className="text-gray-400 text-sm space-y-2">
                                <li>🔐 INCO: Privacy-preserving computation</li>
                                <li>⛓️ Shardeum: Blockchain storage</li>
                                <li>⚡ Real-time tracking</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Privacy</h4>
                            <p className="text-gray-400 text-sm">
                                Raw attention data is never exposed. Only verification results are stored on-chain.
                            </p>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
                        <p>© 2026 POA - Proof of Attention. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
