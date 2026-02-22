
import { 
  User, Class, Subject, Topic, Lesson, Assignment, 
  Submission, Announcement, Progress, AssessmentLevel,
  ClassReportStats, AtRiskStudent, Resource
} from '../types';

export interface DataProvider {
  // User Actions
  getCurrentUser(): Promise<User | null>;
  login(role: 'TEACHER' | 'STUDENT'): Promise<User>; 
  loginWithCredentials(username: string, password: string): Promise<User>;
  register(data: { name: string; username: string; password: string; role: 'TEACHER' | 'STUDENT' }): Promise<User>;
  logout(): Promise<void>;
  
  // Stats
  getDashboardStats(): Promise<{classCount: number, studentCount: number, assignmentCount: number}>;

  // Classes
  getClasses(teacherId?: string): Promise<Class[]>;
  createClass(data: Omit<Class, 'id'>): Promise<Class>;
  updateClass(id: string, data: Partial<Class>): Promise<Class>;
  deleteClass(id: string): Promise<void>;

  // Students
  getAllStudents(): Promise<User[]>;
  getStudentsByClass(classId: string): Promise<User[]>;
  createStudent(data: Omit<User, 'id'>): Promise<User>;
  updateStudent(id: string, data: Partial<User>): Promise<User>;
  deleteStudent(id: string): Promise<void>;

  // Curriculum (Subjects & Topics)
  getSubjects(): Promise<Subject[]>;
  createSubject(data: Omit<Subject, 'id'>): Promise<Subject>;
  updateSubject(id: string, data: Partial<Subject>): Promise<Subject>;
  deleteSubject(id: string): Promise<void>;

  getTopics(subjectId: string): Promise<Topic[]>;
  createTopic(data: Omit<Topic, 'id'>): Promise<Topic>;
  updateTopic(id: string, data: Partial<Topic>): Promise<Topic>;
  deleteTopic(id: string): Promise<void>;

  // Lessons
  getLessons(topicId: string): Promise<Lesson[]>;
  getLessonById(lessonId: string): Promise<Lesson | undefined>;
  createLesson(data: Omit<Lesson, 'id'>): Promise<Lesson>;
  updateLesson(id: string, data: Partial<Lesson>): Promise<Lesson>;
  deleteLesson(id: string): Promise<void>;

  // Resources
  getResourcesByLesson(lessonId: string): Promise<Resource[]>;

  // Assignments
  getAllAssignments(): Promise<Assignment[]>; 
  getAssignmentsByLesson(lessonId: string): Promise<Assignment[]>;
  getAssignmentById(id: string): Promise<Assignment | undefined>;
  createAssignment(data: Omit<Assignment, 'id'>): Promise<Assignment>;
  updateAssignment(id: string, data: Partial<Assignment>): Promise<Assignment>;
  deleteAssignment(id: string): Promise<void>;
  
  // Submissions & Grading
  getMyAssignments(studentId: string): Promise<{assignment: Assignment, submission?: Submission}[]>;
  getSubmissionsByAssignment(assignmentId: string): Promise<{student: User, submission?: Submission}[]>;
  submitAssignment(submission: Pick<Submission, 'assignmentId' | 'studentId' | 'content'>): Promise<Submission>;
  gradeSubmission(submissionId: string, grade: number, assessment: AssessmentLevel, feedback: string): Promise<Submission>;
  
  // Stats & Reports & Progress & Announcements
  getStudentProgress(studentId: string): Promise<Progress[]>;
  updateLessonProgress(studentId: string, lessonId: string, completed: boolean): Promise<Progress>;
  
  // Announcements
  getAnnouncements(classId?: string, target?: string): Promise<Announcement[]>;
  createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt'>): Promise<Announcement>;
  deleteAnnouncement(id: string): Promise<void>;

  // Advanced Reports
  getReportStats(classId: string): Promise<ClassReportStats>;
  getAtRiskStudents(classId: string): Promise<AtRiskStudent[]>;

  // Gradebook
  getGradebookData(classId: string): Promise<{
    students: User[],
    assignments: Assignment[],
    submissions: Submission[]
  }>;
}
