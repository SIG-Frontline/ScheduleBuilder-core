export interface queryFiltersBase {
  [key: string]: string | number | boolean | undefined | { $regex: RegExp };
}

export interface courseQueryFilters extends queryFiltersBase {
  TERM?: string;
  COURSE?: string;
  TITLE?: string | { $regex: RegExp };
  SUBJECT?: string | { $regex: RegExp };
  INSTRUCTOR?: string;
  IS_HONORS?: string;
  IS_ASYNC?: string;
  CREDITS?: string;
  COURSE_LEVEL?: string;
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

export type CourseSearchDBResult = { _id: string; title: string };

export interface CurriculaCourseNode {
  name: string;
  course: string;
}

export type TreeNode = string | string[] | CurriculaCourseNode;
