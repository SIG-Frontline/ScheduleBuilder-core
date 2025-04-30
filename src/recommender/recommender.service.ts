import { BadRequestException, Injectable } from '@nestjs/common';
import { CourseStaticService } from 'src/courseStatic/courseStatic.service';
import { CurriculaService } from 'src/curricula/curricula.service';
import {
  ClassRecommendation,
  ClassRec,
  ClassWild,
  ClassBranch,
  ClassRecType,
  TreeNode,
} from 'src/utils/types.util';

@Injectable()
export class RecommenderService {
  constructor(
    private readonly curriculaService: CurriculaService,
    private readonly courseStaticService: CourseStaticService,
  ) {}
  /**
   * Accepts the user's current degree, major, and catalog year, as well as a list of courses taken to give them a list of recommended classes to take
   *
   * @param degree A degree to search for, like "BS", "BA", etc.
   * @param major A major to search for, like "CS", "CHE", "BIS", etc.
   * @param catalogYear The year the degree was started, like "2025"
   * @param takenCourses A list of courses in the format "CS 100"
   * @returns A tree structure containing the recommended classes and their groups they are with
   *
   */
  async getRecommendedClasses(
    degree: string,
    major: string,
    year: string,
    takenCourses: string[],
  ): Promise<ClassRecommendation[]> {
    const filters = {
      YEAR: year,
      MAJOR: major,
      DEGREE: degree,
    };

    if (!degree) throw new BadRequestException('No degree provided!');
    if (!major) throw new BadRequestException('No major provided!');
    if (!year) throw new BadRequestException('No year provided!');
    if (!takenCourses) throw new BadRequestException('No courses provided!');

    const start = Date.now();

    // Queries the database for the degree
    const curricula = await this.curriculaService.findCurricula(filters, 0, 20);

    // Creates a tree of all courses required for a degree, minus legacy and prereq locked courses
    const curriculaTree = await this.buildTree(curricula.classes, takenCourses);

    // Filters out courses that the user has already taken
    const recommendations = this.filterTree(curriculaTree, takenCourses);
    //console.log('unused classes', takenCourses);

    console.log(`\t - Total time: ${(Date.now() - start) / 1000}s`);

    return recommendations;
  }

  // BUILDING THE TREE \\
  // Parses the conditions, removes legacy classes, checks prereqs, turns from database format to recommender format

  private async buildTree(
    node: TreeNode[],
    takenCourses: string[],
  ): Promise<ClassRecommendation[]> {
    let classes = [] as ClassRecommendation[];
    for (const classTree of node)
      classes = classes.concat(await this.parseTree(classTree, takenCourses));
    return classes;
  }

  private async parseTree(
    node: TreeNode,
    takenCourses: string[],
  ): Promise<ClassRecommendation[]> {
    // Required class
    if ('name' in node) {
      // Keeps all courses the user has already taken, to be removed later (and not mess up the tree)
      if (!takenCourses.includes(node.course)) {
        if (node.legacy) return []; // Do not recommend legacy classes
        if (
          !(await this.courseStaticService.validatePrereqs(
            node.course,
            takenCourses,
          ))
        )
          return []; // Checks the prereqs for that course
      }

      // Splits into wildcard and regular classes
      if (node.course.includes('@')) {
        const c = node as ClassWild;
        c.type = ClassRecType.WILDCARD;
        c.credits = 0;
        c.courses = 0;
        return [c];
      }

      const c = node as ClassRec;
      c.type = ClassRecType.CLASS;
      return [c];
    }

    // Parses the condition statements
    // Returns the parsed array that is relevant to its condition
    if (Array.isArray(node) && node[0] == '$COND') {
      // Checks each condition and returns the class list if true
      for (let i = 1; i < node.length - 1; i += 2) {
        const condition = this.parseCondition(
          node[i] as string[],
          takenCourses,
        );
        if (condition)
          return this.buildTree(node[i + 1] as TreeNode[], takenCourses);
      }

      // Return the else part
      return this.buildTree(node[node.length - 1] as TreeNode[], takenCourses);
    }

    // Parse the class groups
    if (Array.isArray(node) && node[0]) {
      const c = {
        name: node[3] as string,
        type: ClassRecType.BRANCH,
        numCredits: node[2] as unknown as number,
        numClasses: node[1] as unknown as number,
        operator: node[0] as string,
        classes: [] as ClassRecommendation[],
      } as ClassBranch;
      let classes = [] as ClassRecommendation[];

      for (let i = 4; i < node.length; i++)
        classes = classes.concat(
          await this.parseTree(node[i] as TreeNode[], takenCourses),
        );
      if (classes.length == 0) return []; // Remove empty groups (from legacy/prereq parsing)

      c.classes = classes;
      return [c];
    }

    return [];
  }

  // FILTERING THE TREE \\
  // Removes all classes/groups the user has already completed, handles wildcard classes and multi-class/credit groups

  private filterTree(
    node: ClassRecommendation[],
    takenCourses: string[],
  ): ClassRecommendation[] {
    let classes = [] as ClassRecommendation[];
    for (const classTree of node)
      classes = classes.concat(this.parseFilterTree(classTree, takenCourses));
    return classes;
  }

  private parseFilterTree(
    node: ClassRecommendation,
    takenCourses: string[],
  ): ClassRecommendation[] {
    if (node.type == ClassRecType.CLASS) {
      // Remove the course if it has already been taken
      if (takenCourses.includes(node.course)) {
        //console.log(node.course, 'satisfied');
        takenCourses.splice(takenCourses.indexOf(node.course), 1); // Prevent double dipping
        return [];
      }

      return [node];
    } else if (node.type == ClassRecType.WILDCARD) {
      // Handles wildcard classes by incrementing their total courses/credits they have accepted
      const c = this.validateWildcard(node.course, takenCourses);
      if (c != '') {
        // A course can be satisfied by this wildcard
        //console.log(node.course, 'satisfied by', c);
        takenCourses.splice(takenCourses.indexOf(c), 1); // Prevent double dipping
        node.courses += 1;
        node.credits += 3; // FIX: defaulting to 3 credits per course
      }

      return [node];
    } else if (node.type == ClassRecType.BRANCH) {
      // Handle class groups, keeps all wildcards unless the group is satisfied
      let classes = [] as ClassRecommendation[];

      if (node.operator == '&') {
        for (let i = 0; i < node.classes.length; i++)
          classes = classes.concat(
            this.parseFilterTree(node.classes[i], takenCourses),
          );
        if (classes.length == 0) return [];
      } else if (node.operator == '|') {
        const hasClassCount = node.numClasses ? node.numClasses > 0 : false;
        const hasCreditCount = node.numCredits ? node.numCredits > 0 : false;

        let oldClassCount = -1;
        let oldCreditCount = -1;

        // Loops through the tree multiple times for the wildcards, only stopping when satisfied (returned) or no more changes are made
        while (
          node.numClasses != oldClassCount ||
          node.numCredits != oldCreditCount
        ) {
          oldClassCount = hasClassCount ? (node.numClasses as number) : 0;
          oldCreditCount = hasCreditCount ? (node.numCredits as number) : 0;

          for (let i = 0; i < node.classes.length; i++) {
            const classesSubset = this.parseFilterTree(
              node.classes[i],
              takenCourses,
            );

            // If any class was taken, check if the group is satisfied
            if (classesSubset.length == 0) {
              if (hasClassCount && node.numClasses) {
                node.numClasses -= 1;
                if (node.numClasses <= 0) return [];
              } else if (hasCreditCount && node.numCredits) {
                node.numCredits -= 3; // FIX: defaulting to 3 credits per class
                if (node.numCredits <= 0) return [];
              }
              if (!hasClassCount && !hasCreditCount) return []; // Satisfy the OR when no other conditions are specified
            }

            // Check wildcard cases
            for (const c of classesSubset) {
              if (c.type != ClassRecType.WILDCARD) continue;

              if (hasClassCount && node.numClasses) {
                node.numClasses -= c.courses;
                if (node.numClasses <= 0) return [];
              } else if (hasCreditCount && node.numCredits) {
                node.numCredits -= c.credits;
                if (node.numCredits <= 0) return [];
              }

              // Reset amount to not accumulate these amounts
              c.courses = 0;
              c.credits = 0;
            }

            classes = classes.concat(classesSubset);
          }
        }
      }

      node.classes = classes;
      return [node];
    }

    return [];
  }

  // Parses a condition based on the user's taken courses
  private parseCondition(
    condition: string[] | string,
    takenCourses: string[],
  ): boolean {
    // Simple condition
    if (typeof condition === 'string') {
      const pattern = /(.*) WAS (FOUND|PASSED)/;

      const match = condition.match(pattern);
      if (!match) return false; // no defined behavior in the pattern

      // Removes the spaces between the taken courses to match the way degreeworks creates the conditions
      return takenCourses
        .map((str) => str.replace(/\s/g, ''))
        .includes(match[1]);
    }

    // Complex condition
    const operator = condition[0];
    if (operator == '&')
      return (
        this.parseCondition(condition[1], takenCourses) &&
        this.parseCondition(condition[2], takenCourses)
      );
    else if (operator == '|')
      return (
        this.parseCondition(condition[1], takenCourses) ||
        this.parseCondition(condition[2], takenCourses)
      );

    return false;
  }

  // Valids a wildcard class, like 'CS 3@', from a list of takenCourses
  private validateWildcard(wildcard: string, takenCourses: string[]) {
    // Turns the wildcard into a regex pattern
    const wildcardPattern = wildcard.replaceAll('@', '(.*)');

    // Returns the first course that matches the wildcard
    for (const course of takenCourses) {
      if (course.match(wildcardPattern)) return course;
    }

    return '';
  }
}
