
import { DataProvider } from './dataProvider';
import {
  User, UserRole, Class, Subject, Topic, Lesson, LessonStatus,
  Resource, ResourceType, Submission, AssessmentLevel, SubmissionStatus,
  Announcement, AnnouncementTarget, StudentProgress, ClassReportStats, AtRiskStudent, Assignment, AssignmentType
} from '../types';

const STORAGE_KEY = 'lms_v1_data_flat';
const SESSION_KEY = 'lms_v1_session_user_id';

interface DB {
  users: User[];
  classes: Class[];
  subjects: Subject[];
  topics: Topic[];
  lessons: Lesson[];
  resources: Resource[];
  submissions: Submission[];
  announcements: Announcement[];
  progress: StudentProgress[];
}

const seedData: DB = {
  users: [
    { id: 'u1', name: 'Nguyễn Thị Lan', username: 'colan', password: '123', role: UserRole.TEACHER, avatar: 'https://picsum.photos/200' },
    { id: 'u2', name: 'Trần Văn Nam', username: 'namtv', password: '123', role: UserRole.STUDENT, classId: 'c1', avatar: 'https://picsum.photos/201', dob: '2015-05-15', parentPhone: '0912345678' },
    { id: 'u3', name: 'Lê Thị Hoa', username: 'hoalt', password: '123', role: UserRole.STUDENT, classId: 'c1', avatar: 'https://picsum.photos/202', dob: '2015-08-20', parentPhone: '0987654321' },
  ],
  classes: [
    { id: 'c1', name: '3A1', teacherId: 'u1', academicYear: '2023-2024', joinCode: 'TOAN3A1' }
  ],
  subjects: [
    { id: 's1', name: 'Toán', description: 'Môn Toán - Bộ sách Kết nối tri thức' }
  ],
  topics: [
    { id: 't1', subjectId: 's1', name: 'Chủ đề 1: Ôn tập và bổ sung', order: 1 },
    { id: 't2', subjectId: 's1', name: 'Chủ đề 2: Phép nhân, phép chia', order: 2 }
  ],
  lessons: [
    { id: 'l1', topicId: 't1', title: 'Bài 1: Ôn tập các số đến 1000', description: 'Ôn tập số đếm', content: 'Nội dung bài học...', order: 1, status: LessonStatus.PUBLISHED },
    { id: 'l2', topicId: 't1', title: 'Bài 2: Ôn tập phép cộng, phép trừ', description: 'Ôn tập đặt tính', content: 'Nội dung bài học...', order: 2, status: LessonStatus.PUBLISHED }
  ],
  resources: [
    { id: 'r1', lessonId: 'l1', type: ResourceType.VIDEO, title: 'Video: Nhắc lại kiến thức', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', isRequired: true, order: 1 },
    { id: 'r2', lessonId: 'l1', type: ResourceType.GAME, title: 'Game: Ong tìm mật', url: '/game/ong-tim-mat', isRequired: false, order: 2 },
    { id: 'r3', lessonId: 'l1', type: ResourceType.WORKSHEET, title: 'Phiếu bài tập số 1', url: '', isRequired: true, order: 3 },

    { id: 'r4', lessonId: 'l2', type: ResourceType.VIDEO, title: 'Video: Ôn tập cộng trừ', url: '', isRequired: true, order: 1 },
    { id: 'r5', lessonId: 'l2', type: ResourceType.WORKSHEET, title: 'Bài tập về nhà', url: '', isRequired: true, order: 2 }
  ],
  submissions: [
    {
      id: 'sub1', assignmentId: 'r3', studentId: 'u2', submittedAt: '2023-10-19T10:00:00Z',
      content: 'Em nộp bài ạ.',
      isGraded: true,
      assessmentLevel: AssessmentLevel.T,
      assessment: AssessmentLevel.T,
      starsEarned: 3,
      teacherFeedback: 'Cô khen Nam.',
      feedback: 'Cô khen Nam.',
      status: SubmissionStatus.GRADED,
      grade: 10
    }
  ],
  progress: [
    { id: 'p1', studentId: 'u2', resourceId: 'r1', completed: true, completedAt: '2023-10-18T09:00:00Z' },
    { id: 'p2', studentId: 'u2', resourceId: 'r2', completed: true, completedAt: '2023-10-18T09:15:00Z' }
  ],
  announcements: [
    { id: 'ann1', target: AnnouncementTarget.ALL, title: 'Chào mừng năm học mới', content: 'Chúc các em học tốt!', createdAt: '2023-09-05T08:00:00Z', authorId: 'u1' }
  ]
};

class MockProvider implements DataProvider {
  private db: DB;
  private currentUser: User | null = null;

  constructor() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.db = JSON.parse(stored);
    } else {
      this.db = seedData;
      this.save();
    }
    const sessionId = localStorage.getItem(SESSION_KEY);
    if (sessionId) {
      const user = this.db.users.find(u => u.id === sessionId);
      if (user) this.currentUser = user;
    }
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
  }

  private saveSession(user: User) {
    this.currentUser = user;
    localStorage.setItem(SESSION_KEY, user.id);
  }

  private genId() { return Math.random().toString(36).substr(2, 9); }

  async getCurrentUser() { return this.currentUser ? { ...this.currentUser } : null; }
  async login(role: 'TEACHER' | 'STUDENT') {
    const user = this.db.users.find(u => u.role === (role === 'TEACHER' ? UserRole.TEACHER : UserRole.STUDENT));
    if (!user) throw new Error("User not found");
    this.saveSession(user);
    return user;
  }
  async loginWithCredentials(u: string, p: string) {
    const user = this.db.users.find(usr => usr.username === u && usr.password === p);
    if (!user) throw new Error("Invalid credentials");
    this.saveSession(user);
    return user;
  }
  async register(d: any) {
    const newUser = { ...d, id: this.genId(), role: d.role === 'TEACHER' ? UserRole.TEACHER : UserRole.STUDENT, avatar: `https://ui-avatars.com/api/?name=${d.name}` };
    this.db.users.push(newUser);
    this.save();
    this.saveSession(newUser);
    return newUser;
  }
  async logout() { this.currentUser = null; localStorage.removeItem(SESSION_KEY); }

  async getDashboardStats() {
    return {
      studentCount: this.db.users.filter(u => u.role === UserRole.STUDENT).length,
      classCount: this.db.classes.length,
      assignmentCount: this.db.resources.filter(r => r.type === ResourceType.WORKSHEET).length
    };
  }
  async getClasses(tid?: string) { return tid ? this.db.classes.filter(c => c.teacherId === tid) : this.db.classes; }
  async createClass(d: any) { const c = { ...d, id: this.genId() }; this.db.classes.push(c); this.save(); return c; }
  async updateClass(id: string, d: any) { const idx = this.db.classes.findIndex(c => c.id === id); if (idx > -1) { this.db.classes[idx] = { ...this.db.classes[idx], ...d }; this.save(); return this.db.classes[idx]; } throw new Error("Not found"); }
  async deleteClass(id: string) { this.db.classes = this.db.classes.filter(c => c.id !== id); this.save(); }

  async getAllStudents() { return this.db.users.filter(u => u.role === UserRole.STUDENT); }
  async getStudentsByClass(cid: string) { return this.db.users.filter(u => u.classId === cid && u.role === UserRole.STUDENT); }
  async createStudent(d: any) { const s = { ...d, id: this.genId(), role: UserRole.STUDENT }; this.db.users.push(s); this.save(); return s; }
  async updateStudent(id: string, d: any) { const idx = this.db.users.findIndex(u => u.id === id); if (idx > -1) { this.db.users[idx] = { ...this.db.users[idx], ...d }; this.save(); return this.db.users[idx]; } throw new Error("Not found"); }
  async deleteStudent(id: string) { this.db.users = this.db.users.filter(u => u.id !== id); this.save(); }

  async getSubjects() { return this.db.subjects; }
  async createSubject(d: any) { const s = { ...d, id: this.genId() }; this.db.subjects.push(s); this.save(); return s; }
  async updateSubject(id: string, d: any) { return this.db.subjects[0]; }
  async deleteSubject(id: string) { }

  async getTopics(sid: string) { return this.db.topics.filter(t => t.subjectId === sid).sort((a, b) => a.order - b.order); }
  async createTopic(d: any) { const t = { ...d, id: this.genId() }; this.db.topics.push(t); this.save(); return t; }
  async updateTopic(id: string, d: any) { const idx = this.db.topics.findIndex(t => t.id === id); if (idx > -1) { this.db.topics[idx] = { ...this.db.topics[idx], ...d }; this.save(); return this.db.topics[idx]; } throw new Error("Not found"); }
  async deleteTopic(id: string) { this.db.topics = this.db.topics.filter(t => t.id !== id); this.save(); }

  async getLessons(tid: string) { return this.db.lessons.filter(l => l.topicId === tid).sort((a, b) => a.order - b.order); }
  async getLessonById(lid: string) { return this.db.lessons.find(l => l.id === lid); }
  async createLesson(d: any) { const l = { ...d, id: this.genId() }; this.db.lessons.push(l); this.save(); return l; }
  async updateLesson(id: string, d: any) { const idx = this.db.lessons.findIndex(l => l.id === id); if (idx > -1) { this.db.lessons[idx] = { ...this.db.lessons[idx], ...d }; this.save(); return this.db.lessons[idx]; } throw new Error("Not found"); }
  async deleteLesson(id: string) { this.db.lessons = this.db.lessons.filter(l => l.id !== id); this.save(); }

  async getResourcesByLesson(lessonId: string) {
    return this.db.resources.filter(r => r.lessonId === lessonId).sort((a, b) => a.order - b.order);
  }

  async getAllAssignments() {
    return this.db.resources
      .filter(r => r.type === ResourceType.WORKSHEET)
      .map(r => ({
        ...r,
        description: 'Bài tập SGK/Phiếu bài tập',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        rubric: 'Đánh giá theo Thông tư 27',
        points: 10,
        type: AssignmentType.ESSAY
      } as Assignment));
  }

  async getAssignmentById(id: string) {
    const r = this.db.resources.find(res => res.id === id);
    if (!r) return undefined;
    const anyR = r as any;
    return {
      ...r,
      description: anyR.description || 'Chưa có mô tả',
      dueDate: anyR.dueDate || new Date().toISOString(),
      type: anyR.assignmentType || AssignmentType.ESSAY,
      points: anyR.points || 10
    } as Assignment;
  }

  async getAssignmentsByLesson(lessonId: string) {
    const res = await this.getResourcesByLesson(lessonId);
    return res.filter(r => r.type === ResourceType.WORKSHEET).map(r => ({ ...r, type: AssignmentType.ESSAY, points: 10, dueDate: new Date().toISOString() } as Assignment));
  }

  async createAssignment(d: any) {
    const r: Resource = {
      id: this.genId(),
      lessonId: d.lessonId || 'l1',
      type: ResourceType.WORKSHEET,
      title: d.title,
      url: '',
      isRequired: true,
      order: 99,
      ...(d as any) // Giữ lại description, dueDate...
    };
    this.db.resources.push(r);
    this.save();
    return { ...r, ...d } as Assignment;
  }

  async updateAssignment(id: string, d: any) {
    const idx = this.db.resources.findIndex(r => r.id === id);
    if (idx > -1) {
      this.db.resources[idx] = { ...this.db.resources[idx], title: d.title || this.db.resources[idx].title };
      this.save();
      return { ...this.db.resources[idx], ...d } as Assignment;
    }
    throw new Error("Not found");
  }
  async deleteAssignment(id: string) { this.db.resources = this.db.resources.filter(r => r.id !== id); this.save(); }

  async getMyAssignments(studentId: string) {
    const worksheets = this.db.resources.filter(r => r.type === ResourceType.WORKSHEET);
    return worksheets.map(w => {
      const sub = this.db.submissions.find(s => s.assignmentId === w.id && s.studentId === studentId);
      return {
        assignment: { ...w, dueDate: new Date().toISOString(), type: AssignmentType.ESSAY, points: 10 } as Assignment,
        submission: sub
      };
    });
  }

  async getSubmissionsByAssignment(aid: string) {
    const students = this.db.users.filter(u => u.role === UserRole.STUDENT);
    return students.map(s => {
      const sub = this.db.submissions.find(sub => sub.assignmentId === aid && sub.studentId === s.id);
      return { student: s, submission: sub };
    });
  }

  async submitAssignment(d: Pick<Submission, 'assignmentId' | 'studentId' | 'content'>) {
    const sub: Submission = {
      ...d,
      id: this.genId(),
      submittedAt: new Date().toISOString(),
      isGraded: false,
      starsEarned: 0,
      status: SubmissionStatus.SUBMITTED
    };
    const idx = this.db.submissions.findIndex(s => s.assignmentId === d.assignmentId && s.studentId === d.studentId);
    if (idx > -1) {
      this.db.submissions[idx] = { ...this.db.submissions[idx], ...sub, id: this.db.submissions[idx].id, status: SubmissionStatus.SUBMITTED };
      this.save();
      return this.db.submissions[idx];
    }
    else { this.db.submissions.push(sub); this.save(); return sub; }
  }

  async gradeSubmission(subId: string, grade: number, level: AssessmentLevel, feedback: string) {
    const idx = this.db.submissions.findIndex(s => s.id === subId);
    if (idx === -1) throw new Error("Not found");

    let stars = 0;
    if (level === AssessmentLevel.T) stars = 3;
    else if (level === AssessmentLevel.H) stars = 1;

    this.db.submissions[idx] = {
      ...this.db.submissions[idx],
      isGraded: true,
      assessmentLevel: level,
      assessment: level,
      teacherFeedback: feedback,
      feedback: feedback,
      grade: grade,
      starsEarned: stars,
      status: SubmissionStatus.GRADED
    };
    this.save();
    return this.db.submissions[idx];
  }

  async getStudentProgress(sid: string) {
    return this.db.progress.filter(p => p.studentId === sid);
  }

  async updateLessonProgress(sid: string, lessonId: string, completed: boolean) {
    const resources = this.db.resources.filter(r => r.lessonId === lessonId);
    if (resources.length > 0) {
      const rid = resources[0].id;
      const idx = this.db.progress.findIndex(p => p.studentId === sid && p.resourceId === rid);
      if (idx > -1) {
        this.db.progress[idx].completed = completed;
      } else {
        this.db.progress.push({ id: this.genId(), studentId: sid, resourceId: rid, lessonId, completed: completed, completedAt: new Date().toISOString() });
      }
      this.save();
    }
    return { id: 'temp', studentId: sid, resourceId: lessonId, lessonId, completed } as StudentProgress;
  }

  async getAnnouncements(cid?: string, tgt?: string) { return this.db.announcements; }
  async createAnnouncement(d: any) { const a = { ...d, id: this.genId(), createdAt: new Date().toISOString() }; this.db.announcements.push(a); this.save(); return a; }
  async deleteAnnouncement(id: string) { this.db.announcements = this.db.announcements.filter(a => a.id !== id); this.save(); }
  async getReportStats(cid: string) { return { totalStudents: 30, avgGrade: 0, submissionRate: 80, lessonCompletionRate: 70 }; }
  async getAtRiskStudents(cid: string) { return []; }
  async getGradebookData(cid: string) { return { students: [], assignments: [], submissions: [] }; }
}

export const mockProvider = new MockProvider();
