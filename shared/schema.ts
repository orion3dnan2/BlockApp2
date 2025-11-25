import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, serial, json, integer, boolean, date, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const availablePermissions = [
  "dashboard",
  "search",
  "data_entry",
  "reports",
  "import",
  "settings_users",
  "settings_stations",
  "settings_ports",
  "hr_employees",
  "hr_attendance",
  "hr_leaves",
  "hr_performance",
  "workflow_create",
  "workflow_review",
  "workflow_approve",
  "workflow_sign",
  "admin_system",
] as const;

export type Permission = typeof availablePermissions[number];

export const roles = [
  "admin",
  "hr",
  "manager",
  "reviewer",
  "director",
  "employee",
  "supervisor",
  "user"
] as const;

export type Role = typeof roles[number];

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("user"),
  permissions: json("permissions").$type<Permission[]>(),
});

export const policeStations = pgTable("police_stations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  governorate: text("governorate").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const ports = pgTable("ports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const records = pgTable("records", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  recordNumber: serial("record_number").notNull().unique(),
  outgoingNumber: text("outgoing_number").notNull(),
  militaryNumber: text("military_number"),
  actionType: text("action_type"),
  ports: text("ports"),
  recordedNotes: text("recorded_notes"),
  firstName: text("first_name").notNull(),
  secondName: text("second_name").notNull(),
  thirdName: text("third_name").notNull(),
  fourthName: text("fourth_name").notNull(),
  tourDate: timestamp("tour_date").notNull(),
  rank: text("rank").notNull(),
  governorate: text("governorate").notNull(),
  office: text("office"),
  policeStation: text("police_station"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const employees = pgTable("employees", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  employeeNumber: text("employee_number").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: date("date_of_birth"),
  hireDate: date("hire_date").notNull(),
  department: text("department"),
  position: text("position"),
  manager: varchar("manager", { length: 36 }).references((): any => employees.id),
  status: text("status").notNull().default("active"),
  profilePhoto: text("profile_photo"),
  nationalId: text("national_id"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const attendance = pgTable("attendance", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  employeeId: varchar("employee_id", { length: 36 }).notNull().references(() => employees.id),
  date: date("date").notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  status: text("status").notNull().default("present"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leaves = pgTable("leaves", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  employeeId: varchar("employee_id", { length: 36 }).notNull().references(() => employees.id),
  leaveType: text("leave_type").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  days: integer("days").notNull(),
  reason: text("reason"),
  status: text("status").notNull().default("pending"),
  approvedBy: varchar("approved_by", { length: 36 }).references(() => users.id),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const performanceReviews = pgTable("performance_reviews", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  employeeId: varchar("employee_id", { length: 36 }).notNull().references(() => employees.id),
  reviewerId: varchar("reviewer_id", { length: 36 }).notNull().references(() => users.id),
  period: text("period").notNull(),
  rating: integer("rating").notNull(),
  strengths: text("strengths"),
  weaknesses: text("weaknesses"),
  goals: text("goals"),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const disciplinaryActions = pgTable("disciplinary_actions", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  employeeId: varchar("employee_id", { length: 36 }).notNull().references(() => employees.id),
  type: text("type").notNull(),
  reason: text("reason").notNull(),
  issuedBy: varchar("issued_by", { length: 36 }).notNull().references(() => users.id),
  issuedAt: timestamp("issued_at").defaultNow(),
  severity: text("severity").notNull(),
  notes: text("notes"),
});

export const documents = pgTable("documents", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  employeeId: varchar("employee_id", { length: 36 }).references(() => employees.id),
  workflowId: varchar("workflow_id", { length: 36 }),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  uploadedBy: varchar("uploaded_by", { length: 36 }).notNull().references(() => users.id),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workflowTemplates = pgTable("workflow_templates", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  steps: json("steps").$type<any[]>().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by", { length: 36 }).notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workflowInstances = pgTable("workflow_instances", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  templateId: varchar("template_id", { length: 36 }).notNull().references(() => workflowTemplates.id),
  documentNumber: text("document_number").notNull().unique(),
  subject: text("subject").notNull(),
  content: text("content"),
  fromDepartment: text("from_department"),
  toDepartment: text("to_department"),
  currentStep: integer("current_step").notNull().default(0),
  status: text("status").notNull().default("draft"),
  priority: text("priority").notNull().default("normal"),
  createdBy: varchar("created_by", { length: 36 }).notNull().references(() => users.id),
  barcode: text("barcode"),
  pdfPath: text("pdf_path"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workflowSteps = pgTable("workflow_steps", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  workflowId: varchar("workflow_id", { length: 36 }).notNull().references(() => workflowInstances.id),
  stepNumber: integer("step_number").notNull(),
  stepName: text("step_name").notNull(),
  assignedTo: varchar("assigned_to", { length: 36 }).references(() => users.id),
  status: text("status").notNull().default("pending"),
  action: text("action"),
  comments: text("comments"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const digitalSignatures = pgTable("digital_signatures", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  pinCode: text("pin_code").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const signatures = pgTable("signatures", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  workflowId: varchar("workflow_id", { length: 36 }).notNull().references(() => workflowInstances.id),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  documentHash: text("document_hash").notNull(),
  signature: text("signature").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  signedAt: timestamp("signed_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  changes: json("changes"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(),
  read: boolean("read").notNull().default(false),
  link: text("link"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  role: true,
  permissions: true,
}).extend({
  role: z.enum(roles).default("employee"),
  permissions: z.array(z.enum(availablePermissions)).optional().default([]),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({
  id: true,
  createdAt: true,
});

export const insertLeaveSchema = createInsertSchema(leaves).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedBy: true,
  approvedAt: true,
});

export const insertPerformanceReviewSchema = createInsertSchema(performanceReviews).omit({
  id: true,
  createdAt: true,
});

export const insertDisciplinaryActionSchema = createInsertSchema(disciplinaryActions).omit({
  id: true,
  issuedAt: true,
});

export const insertWorkflowTemplateSchema = createInsertSchema(workflowTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertWorkflowInstanceSchema = createInsertSchema(workflowInstances).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  barcode: true,
  pdfPath: true,
});

export const insertWorkflowStepSchema = createInsertSchema(workflowSteps).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertDigitalSignatureSchema = createInsertSchema(digitalSignatures).omit({
  id: true,
  createdAt: true,
});

export const insertSignatureSchema = createInsertSchema(signatures).omit({
  id: true,
  signedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertPoliceStationSchema = createInsertSchema(policeStations).omit({
  id: true,
  createdAt: true,
});

export const insertPortSchema = createInsertSchema(ports).omit({
  id: true,
  createdAt: true,
});

export const insertRecordSchema = createInsertSchema(records).omit({
  id: true,
  recordNumber: true,
  createdAt: true,
}).extend({
  tourDate: z.union([z.date(), z.string()]).pipe(z.coerce.date()),
  office: z.string().nullish().transform(val => val || null),
  policeStation: z.string().nullish().transform(val => val || null),
  ports: z.string().nullish().transform(val => val || null),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;
export type InsertLeave = z.infer<typeof insertLeaveSchema>;
export type Leave = typeof leaves.$inferSelect;
export type InsertPerformanceReview = z.infer<typeof insertPerformanceReviewSchema>;
export type PerformanceReview = typeof performanceReviews.$inferSelect;
export type InsertDisciplinaryAction = z.infer<typeof insertDisciplinaryActionSchema>;
export type DisciplinaryAction = typeof disciplinaryActions.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertWorkflowTemplate = z.infer<typeof insertWorkflowTemplateSchema>;
export type WorkflowTemplate = typeof workflowTemplates.$inferSelect;
export type InsertWorkflowInstance = z.infer<typeof insertWorkflowInstanceSchema>;
export type WorkflowInstance = typeof workflowInstances.$inferSelect;
export type InsertWorkflowStep = z.infer<typeof insertWorkflowStepSchema>;
export type WorkflowStep = typeof workflowSteps.$inferSelect;
export type InsertDigitalSignature = z.infer<typeof insertDigitalSignatureSchema>;
export type DigitalSignature = typeof digitalSignatures.$inferSelect;
export type InsertSignature = z.infer<typeof insertSignatureSchema>;
export type Signature = typeof signatures.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertPoliceStation = z.infer<typeof insertPoliceStationSchema>;
export type PoliceStation = typeof policeStations.$inferSelect;
export type InsertPort = z.infer<typeof insertPortSchema>;
export type Port = typeof ports.$inferSelect;
export type InsertRecord = z.infer<typeof insertRecordSchema>;
export type Record = typeof records.$inferSelect;
