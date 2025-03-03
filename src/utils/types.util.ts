export interface queryFilters {
  TERM?: string;
  COURSE?: string;
  TITLE?: string;
  SUBJECT?: string;
  INSTRUCTOR?: string;
  IS_HONORS?: string;
  IS_ASYNC?: string;
  CREDITS?: string;
  COURSE_LEVEL?: string;
  SUMMER_PERIOD?: string;
  INSTRUCTION_METHOD?: string;
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

export interface Course {
  _id: string;
  COURSE: string;
  TITLE: string;
  SECTION: string;
  CRN: string;
  DAYS: Days;
  INSTRUCTOR: string;
  CREDITS: number;
  IS_ASYNC: boolean;
  SUBJECT: string;
  TERM: string;
}

export interface SectionResponse {
  courses: Course[];
  totalNumCourses: number;
}

export type TreeType = (string | null | TreeType[])[];
