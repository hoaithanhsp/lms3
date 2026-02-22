import { DataProvider } from './dataProvider';
import { User, UserRole, Class, Topic, Lesson, Assignment, Submission, Resource, Announcement, Progress, WeeklyReportStats, ClassReportStats, AtRiskStudent } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

// Helper: Map backend 'fullName' to frontend 'name'
function mapUser(u: any): User {
  if (!u) return u;
  return { ...u, name: u.fullName || u.name };
}

// Helper: Map GAS Assignment to Frontend Assignment
function mapAssignment(a: any): Assignment {
  return {
    ...a,
    type: 'WORKSHEET', // Default type
    url: a.attachmentUrl || '',
    isRequired: true, // Default
    order: 99, // Default
    points: a.maxStars || 10,
    dueDate: a.dueDate || new Date().toISOString(),
    description: a.description || ''
  };
}

/**
 * Hàm gọi API chung (Helper)
 * Tự động thêm header, xử lý lỗi mạng, parse JSON
 * Nâng cấp: Offline check, Timeout 10s, Error Handling
 */
async function apiClient<T>(action: string, payload: any = {}): Promise<T> {
  if (!API_URL) {
    throw new Error("Chưa cấu hình VITE_API_URL trong file .env");
  }

  // 1. Kiểm tra trạng thái mạng chủ động (Offline Check)
  if (!navigator.onLine) {
    throw new Error('Máy tính đang mất kết nối mạng. Em hãy nhờ bố mẹ kiểm tra lại Wi-Fi nhé!');
  }

  // 2. Thiết lập Timeout 10s
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      // Google Apps Script yêu cầu content-type text/plain để tránh preflight OPTIONS request phức tạp
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload }),
      signal: controller.signal // Gắn signal để hủy request nếu timeout
    });

    clearTimeout(timeoutId); // Hủy timeout nếu request thành công

    if (!response.ok) {
      throw new Error(`Lỗi HTTP: ${response.status}`);
    }

    const result = await response.json();

    if (!result.ok) {
      throw new Error(result.error || 'Lỗi không xác định từ máy chủ');
    }

    return result.data as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error(`API Error [${action}]:`, error);

    // 3. Xử lý lỗi Timeout
    if (error.name === 'AbortError') {
      throw new Error('Đường truyền đang hơi chậm, Cô/Em vui lòng nhấn tải lại trang nhé!');
    }

    // Xử lý lỗi mất kết nối (nếu navigator.onLine chưa kịp cập nhật)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng!');
    }

    throw error;
  }
}

export const sheetProvider: DataProvider = {
  // --- AUTH ---
  login: async (role) => {
    throw new Error("Sheet provider requires credentials (username/password)");
  },

  loginWithCredentials: async (username, password) => {
    // Ensure credentials are strings to match GAS logic
    const user = await apiClient<any>('auth.login', { 
      username: String(username), 
      password: String(password) 
    });
    const mapped = mapUser(user);
    localStorage.setItem('user', JSON.stringify(mapped));
    return mapped;
  },

  register: async (data) => {
    if (data.role === 'TEACHER') {
      throw new Error("Đăng ký giáo viên chưa được hỗ trợ qua API này.");
    }
    const user = await apiClient<any>('students.add', { 
      fullName: data.name, 
      username: String(data.username), 
      password: String(data.password) 
    });
    const mapped = mapUser(user);
    localStorage.setItem('user', JSON.stringify(mapped));
    return mapped;
  },

  logout: async () => {
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  },

  // --- STATS ---
  getDashboardStats: async () => {
    try {
      const classes = await apiClient<Class[]>('classes.list');
      const students = await apiClient<User[]>('students.list');
      const assignments = await apiClient<Assignment[]>('assignments.list');
      return {
        classCount: classes.length,
        studentCount: students.length,
        assignmentCount: assignments.length
      };
    } catch (e) {
      console.warn("Stats error:", e);
      return { classCount: 0, studentCount: 0, assignmentCount: 0 };
    }
  },

  // --- CLASSES ---
  getClasses: async (teacherId) => {
    const classes = await apiClient<Class[]>('classes.list');
    if (teacherId) return classes.filter(c => c.teacherId === teacherId);
    return classes;
  },
  createClass: async (data) => { return apiClient<Class>('classes.create', data); },
  updateClass: async (id, data) => { return apiClient<Class>('classes.update', { id, ...data }); },
  deleteClass: async (id) => { await apiClient('classes.delete', { id }); },

  // --- STUDENTS ---
  getAllStudents: async () => {
    const users = await apiClient<any[]>('students.list');
    return users.map(mapUser);
  },
  getStudentsByClass: async (classId) => {
    const users = await apiClient<any[]>('students.list', { classId });
    return users.map(mapUser);
  },
  createStudent: async (data) => {
    // Map 'name' -> 'fullName' for backend
    const payload = { ...data, fullName: data.name };
    const user = await apiClient<any>('students.add', payload);
    return mapUser(user);
  },
  updateStudent: async (id, data) => { 
    // Map 'name' -> 'fullName' if present
    const payload = { ...data };
    if (data.name) payload.fullName = data.name;
    const user = await apiClient<any>('students.update', { id, ...payload });
    return mapUser(user);
  },
  deleteStudent: async (id) => { await apiClient('students.delete', { id }); },

  // --- CURRICULUM ---
  getSubjects: async () => { 
    try {
      const subjects = await apiClient<any[]>('subjects.list');
      // Fallback if empty or not yet migrated
      if (!subjects || subjects.length === 0) {
        return [{id: 'MATH', name: 'Toán', description: 'Môn Toán'}];
      }
      return subjects;
    } catch (e) {
      // Fallback for backward compatibility if sheet missing
      return [{id: 'MATH', name: 'Toán', description: 'Môn Toán'}];
    }
  },
  createSubject: async (data) => { 
    try {
      return await apiClient<any>('subjects.create', data); 
    } catch (error: any) {
      if (error.message && error.message.includes("Không tìm thấy Sheet")) {
        throw new Error("Chưa có bảng Subjects. Vui lòng chạy 'Khởi tạo Database' trong menu LMS Admin của Google Sheet.");
      }
      throw error;
    }
  },
  updateSubject: async (id, data) => { return apiClient<any>('subjects.update', { id, ...data }); },
  deleteSubject: async (id) => { await apiClient('subjects.delete', { id }); },

  getTopics: async (subjectId) => {
    return apiClient<Topic[]>('modules.list');
  },
  createTopic: async (data) => { return apiClient<Topic>('modules.create', data); },
  updateTopic: async (id, data) => { return apiClient<Topic>('modules.update', { id, ...data }); },
  deleteTopic: async (id) => { await apiClient('modules.delete', { id }); },

  // --- LESSONS ---
  getAllLessons: async () => {
    return apiClient<Lesson[]>('lessons.list');
  },
  getLessons: async (topicId) => {
    const all = await apiClient<Lesson[]>('lessons.list');
    return all.filter(l => l.moduleId === topicId || l.topicId === topicId);
  },
  getLessonById: async (id) => {
    const all = await apiClient<Lesson[]>('lessons.list');
    return all.find(l => l.id === id);
  },
  createLesson: async (data) => { 
    // Map topicId to moduleId for backend compatibility
    const payload = { ...data, moduleId: data.topicId || data.moduleId };
    return apiClient<Lesson>('lessons.create', payload); 
  },
  updateLesson: async (id, data) => { 
    const payload = { ...data, moduleId: data.topicId || data.moduleId };
    return apiClient<Lesson>('lessons.update', { id, ...payload }); 
  },
  deleteLesson: async (id) => { await apiClient('lessons.delete', { id }); },

  // --- RESOURCES ---
  getResourcesByLesson: async (lessonId) => {
    const all = await apiClient<Resource[]>('resources.list');
    return all.filter(r => r.lessonId === lessonId);
  },

  // --- ASSIGNMENTS ---
  getAllAssignments: async () => {
    const all = await apiClient<any[]>('assignments.list');
    return all.map(mapAssignment);
  },
  getAssignmentsByLesson: async (lessonId) => {
    const all = await apiClient<any[]>('assignments.list');
    return all.filter(a => a.lessonId === lessonId).map(mapAssignment);
  },
  getAssignmentById: async (id) => {
    const all = await apiClient<any[]>('assignments.list');
    const found = all.find(a => a.id === id);
    return found ? mapAssignment(found) : undefined;
  },
  createAssignment: async (data) => {
    const res = await apiClient<any>('assignments.create', data);
    return mapAssignment(res);
  },
  updateAssignment: async (id, data) => { 
    const res = await apiClient<any>('assignments.update', { id, ...data });
    return mapAssignment(res);
  },
  deleteAssignment: async (id) => { await apiClient('assignments.delete', { id }); },

  // --- SUBMISSIONS ---
  getMyAssignments: async (studentId) => {
    const assignments = await apiClient<any[]>('assignments.list');
    const submissions = await apiClient<Submission[]>('evaluations.list', { studentId });
    return assignments.map(a => ({
      assignment: mapAssignment(a),
      submission: submissions.find(s => s.assignmentId === a.id)
    }));
  },
  getSubmissionsByAssignment: async (assignmentId) => {
    const submissions = await apiClient<Submission[]>('evaluations.list', { assignmentId });
    const students = await apiClient<any[]>('students.list');
    
    // Return ALL students, with their submission if exists
    return students.map(u => {
      const student = mapUser(u);
      const submission = submissions.find(s => s.studentId === student.id);
      return { student, submission };
    });
  },
  submitAssignment: async (submission) => {
    // Map to evaluations.add (student submission)
    return apiClient<Submission>('evaluations.add', submission);
  },
  gradeSubmission: async (submissionId, grade, assessment, feedback) => {
    // Map to evaluations.grade (teacher grading)
    return apiClient<Submission>('evaluations.grade', { 
      id: submissionId, 
      grade, 
      assessmentLevel: assessment, 
      teacherFeedback: feedback,
      starsEarned: grade >= 9 ? 3 : (grade >= 7 ? 2 : 1) // Logic tính sao đơn giản
    });
  },

  // --- PROGRESS ---
  getStudentProgress: async (studentId) => {
    return apiClient<Progress[]>('progress.list', { studentId });
  },
  updateLessonProgress: async (studentId, lessonId, completed) => {
    return apiClient<Progress>('progress.update', { studentId, resourceId: lessonId, isCompleted: completed });
  },

  // --- ANNOUNCEMENTS ---
  getAnnouncements: async (classId, target) => {
    try {
      return await apiClient<Announcement[]>('announcements.list', { classId });
    } catch (error: any) {
      // If sheet missing, return empty array instead of crashing
      if (error.message && error.message.includes("Không tìm thấy Sheet")) {
        console.warn("Announcements sheet missing, returning empty list.");
        return [];
      }
      throw error;
    }
  },
  createAnnouncement: async (data) => { 
    try {
      return await apiClient<Announcement>('announcements.create', data); 
    } catch (error: any) {
      if (error.message && error.message.includes("Không tìm thấy Sheet")) {
        throw new Error("Chưa có bảng Announcements. Vui lòng chạy 'Khởi tạo Database' trong menu LMS Admin của Google Sheet.");
      }
      throw error;
    }
  },
  deleteAnnouncement: async (id) => { await apiClient('announcements.delete', { id }); },

  // --- REPORTS ---
  getReportStats: async (classId) => {
    return {
      totalStudents: 0,
      avgGrade: 0,
      submissionRate: 0,
      lessonCompletionRate: 0
    };
  },
  getAtRiskStudents: async (classId) => { return []; },

  // --- GRADEBOOK ---
  getGradebookData: async (classId) => {
    const students = await apiClient<User[]>('students.list', { classId });
    const assignments = await apiClient<Assignment[]>('assignments.list');
    const submissions = await apiClient<Submission[]>('evaluations.list');
    return { students, assignments, submissions };
  }
};
