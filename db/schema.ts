import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role', { enum: ['TEACHER', 'STUDENT'] }).notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => [uniqueIndex('idx_users_username').on(table.username)]);

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at').notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => [index('idx_sessions_user_id').on(table.userId), index('idx_sessions_expires_at').on(table.expiresAt)]);

export const exams = sqliteTable('exams', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
  teacherId: text('teacher_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (table) => [index('idx_exams_teacher_id').on(table.teacherId), index('idx_exams_published').on(table.isPublished)]);

export const questions = sqliteTable('questions', {
  id: text('id').primaryKey(),
  examId: text('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  points: integer('points').notNull().default(1),
  position: integer('position').notNull(),
}, (table) => [index('idx_questions_exam_position').on(table.examId, table.position)]);

export const choices = sqliteTable('choices', {
  id: text('id').primaryKey(),
  questionId: text('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull().default(false),
  position: integer('position').notNull(),
}, (table) => [index('idx_choices_question_position').on(table.questionId, table.position)]);

export const submissions = sqliteTable('submissions', {
  id: text('id').primaryKey(),
  examId: text('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade' }),
  studentId: text('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  score: integer('score').notNull(),
  submittedAt: integer('submitted_at').notNull(),
}, (table) => [
  uniqueIndex('idx_submissions_exam_student').on(table.examId, table.studentId),
  index('idx_submissions_exam_id').on(table.examId),
  index('idx_submissions_student_id').on(table.studentId),
]);

export const studentAnswers = sqliteTable('student_answers', {
  id: text('id').primaryKey(),
  submissionId: text('submission_id').notNull().references(() => submissions.id, { onDelete: 'cascade' }),
  questionId: text('question_id').notNull().references(() => questions.id, { onDelete: 'cascade' }),
  choiceId: text('choice_id').references(() => choices.id, { onDelete: 'set null' }),
  isCorrect: integer('is_correct', { mode: 'boolean' }).notNull().default(false),
}, (table) => [index('idx_student_answers_submission_id').on(table.submissionId)]);
