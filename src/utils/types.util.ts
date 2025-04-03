export interface queryFiltersBase {
  [key: string]:
    | string
    | number
    | boolean
    | undefined
    | { $regex: RegExp }
    | { $in: number[] };
}

export interface courseQueryFilters extends queryFiltersBase {
  TERM?: string;
  COURSE?: string;
  TITLE?: string | { $regex: RegExp };
  SUBJECT?: string | { $regex: RegExp };
  INSTRUCTOR?: string;
  IS_HONORS?: boolean;
  IS_ASYNC?: boolean;
  CREDITS?: number;
  COURSE_LEVEL?: number | { $in: number[] };
  SUMMER_PERIOD?: string;
  INSTRUCTION_METHOD?: string;
}

export interface curriculaFilters extends queryFiltersBase {
  YEAR: string;
  MAJOR: string;
  DEGREE: string;
}

export interface Days {
  M: boolean;
  T: boolean;
  W: boolean;
  R: boolean;
  F: boolean;
  S: boolean;
  U: boolean;
}

export interface MeetingTime {
  day: string;
  start: string;
  end: string;
  building: string | null;
  room: string | null;
}

export interface Section {
  _id: string;
  TERM: string;
  COURSE: string;
  TITLE: string;
  SECTION: string;
  CRN: string;
  INSTRUCTION_METHOD: string;
  DAYS: Days;
  TIMES: MeetingTime[];
  MAX: number;
  NOW: number;
  STATUS: string;
  INSTRUCTOR: string | null;
  COMMENTS: string | null;
  CREDITS: number;
  INFO_LINK: string;
  IS_HONORS: boolean;
  IS_ASYNC: boolean;
  SUBJECT: string;
  COURSE_LEVEL: number;
  SUMMER_PERIOD: string | null;
  selected: boolean;
}

export interface Course {
  _id: string;
  title: string;
  credits: number;
  description: string;
  sections: Section[];
}

export type CourseStaticNode = (string | null | CourseStaticNode)[];

export interface SectionResponse {
  course: Course;
  totalNumCourses: number;
}

export interface CourseResponse {
  courses: { _id: string; title: string; subject: string }[];
  totalNumCourses: number;
}

export interface CurriculaResponse {
  _id: string;
  school: string;
  degree: string;
  major: string;
  year: string;
  classes: TreeNode[];
}

export interface SubjectsResponse {
  _id: string;
  term: string;
  subjects: string[];
}

export interface TermsResponse {
  terms: string[];
}

export interface UserPlanResponse {
  userId: string;
  uuid: string;
  planData: PlanData;
}

export type CourseSearchDBResult = { _id: string; title: string };

export interface CurriculaCourseNode {
  name: string;
  course: string;
  legacy: boolean;
}

export type TreeNode = string | string[] | CurriculaCourseNode;

export interface PlanData {
  uuid: string;
  name: string;
  description: string;
  term: number;
  selected: boolean;
  courses: PlanDataCourses[];
  events: Events[];
  organizerSettings?: organizerSettings;
}

export interface PlanDataCourses {
  title: string;
  credits: number;
  sections: PlanDataSection[];
  description: string;
  code: string;
  color: string;
}

export interface PlanDataSection {
  meetingTimes: PlanDataMeetingTime[];
  instructor: string;
  crn: string;
  currentEnrollment: number;
  maxEnrollment: number;
  status: string;
  is_honors: boolean;
  is_async: boolean;
  instruction_type: string;
  sectionNumber: string;
  comments: string;
  selected: boolean;
}

export type PlanDataMeetingTime = {
  day: string;
  startTime: string;
  endTime: string;
  building: string;
  room: string;
};

export interface Events {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  color: string;
}

// Organizer
export interface organizerSettings {
  isCommuter: boolean;
  commuteTimeHours: number;
  compactPlan: boolean;
  courseFilters: courseFilter[];
}

export interface courseFilter {
  courseCode: string;
  instructor?: string;
  honors?: boolean;
  online?: instructionType;
  section?: string;
}
export enum instructionType {
  ONLINE = 'online',
  HYBRID = 'hybrid',
  INPERSON = 'face-to-face',
  ANY = 'any',
}
