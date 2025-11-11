import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  PlanDataMeetingTime,
  PlanData,
  PlanDataSection,
} from '../utils/types.util';

@Injectable()
export class OrganizerService {
  constructor() {}

  /**
   * Accepts a plan to organize. It will then return a plan which is scored to be the "most optimal"
   *
   * @param currentPlan The currently selected plan to organize
   * @returns A Plan object with the most optimal schedule generated based on the 'rateSections' function, undefined if none can be generated with the given inputs
   */
  async organizePlan(currentPlan: PlanData): Promise<PlanData[]> {
    // Copy the plan so we can modify some values without changing the underlying data
    const copyPlan = (await JSON.parse(
      JSON.stringify(currentPlan),
    )) as PlanData;

    const start = Date.now();

    // Filters all the sections in the current plan in place
    this.filterSectionsInPlan(copyPlan);

    // Checks if filters are too restrictive (filter out all sections of one course)
    const tooRestrictive = copyPlan.courses?.some(
      (c) => c.sections.length == 0,
    );

    if (tooRestrictive)
      throw new NotFoundException(
        'Filters are too restrictive. No schedules could be made from those filters, please reduce your preferences.',
      );

    // Generate all possible schedule combinations as plans
    const allPossibleSectionCombos = this.generateCombos(copyPlan);

    if (allPossibleSectionCombos.length == 0)
      throw new NotFoundException(
        'Courses are not compatible. One or more courses have all sections overlapping with another course, please reduce your locked courses or remove the conflicting courses.',
      );

    // Rank the plans using rateSections()
    const bestSectionsList = this.findBestSections(
      allPossibleSectionCombos,
      copyPlan,
    );

    const bestPlans = [] as PlanData[];
    for (const bestSections of bestSectionsList) {
      bestPlans.push(this.convertSectionListToPlan(currentPlan, bestSections));
    }
    Logger.log(`\t - Total time: ${(Date.now() - start) / 1000}s`);

    // Return most optimal schedule
    return bestPlans;
  }

  // Filters out sections that do not match the specified filters
  private filterSectionsInPlan(plan: PlanData): void {
    // Filter out cancelled sections
    plan.courses?.forEach(
      (c) =>
        (c.sections = c.sections.filter(
          (s) =>
            s.status?.toLowerCase() != 'cancelled' &&
            !s.comments?.toLowerCase().includes('cancelled'),
        )),
    );

    const courseFilters = plan.organizerSettings?.courseFilters;
    const locked = [] as string[];

    // Perform all the filters for the courses
    if (courseFilters) {
      for (const filter of courseFilters) {
        plan.courses?.forEach((course) => {
          if (course.code !== filter.courseCode) return;

          course.sections = course.sections.filter(
            (s) =>
              (filter.instructor == null ||
                s.instructor == filter.instructor) &&
              (filter.honors == null || s.is_honors == filter.honors) &&
              (filter.online == null ||
                s.instructionType.toLowerCase().includes(filter.online)) &&
              (filter.section == null || s.sectionNumber == filter.section),
          );
        });
        // Remember the locked courses
        if (filter.section != null)
          locked.push(`${filter.courseCode} ${filter.section}`);
      }
    }

    // Modify all meeting time strings to be minutes from midnight for much easier math (and avoid multiple conversions with Date)
    plan.courses?.forEach((c) =>
      c.sections.forEach((s) =>
        s.meetingTimes.forEach((m) => {
          // @ts-expect-error Changing ISO string to a number (ignoring timezone)
          m.startTime =
            Number(m.startTime.split(/T|:/)[1]) * 60 +
            Number(m.startTime.split(/T|:/)[2]);
          // @ts-expect-error Changing ISO string to a number (ignoring timezone)
          m.endTime =
            Number(m.endTime.split(/T|:/)[1]) * 60 +
            Number(m.endTime.split(/T|:/)[2]);
        }),
      ),
    );

    // TODO: Add a toggle to take into account the enrollment of each section
    // And to not recommend sections that are full
    // if (false) {
    //   plan.courses?.forEach((c) => {
    //     c.sections = c.sections.filter((s) => {
    //       // Bypass for locked sections
    //       if (locked.includes(`${c.code} ${s.sectionNumber}`)) return true;
    //
    //       return s.currentEnrollment < s.maxEnrollment;
    //     });
    //   });
    // }

    // Remove extra online sections while generating
    // If a course has 10 online sections, it might as well only have 1
    const hasOnline: { [key: string]: boolean } = {};

    plan.courses?.forEach((course) => {
      for (let i = 0; i < course.sections.length; i++) {
        const s = course.sections[i];

        if (s.meetingTimes.length == 0) {
          if (!hasOnline[course.code]) {
            hasOnline[course.code] = true;
          } else {
            course.sections.splice(i, 1);
            i--;
            continue;
          }
        }
      }
    });

    // Filter out sections that overlap with events
    if (plan.organizerSettings.eventPriority) {
      plan.courses?.forEach((course) => {
        course.sections = course.sections.filter((section) => {
          // Skip courses that are locked
          if (locked.includes(`${course.code} ${section.sectionNumber}`))
            return true;
          // Skip online courses
          if (!section.meetingTimes) return true;

          let keep = true;

          section.meetingTimes?.forEach((meeting) => {
            plan.events.forEach((e) => {
              const eStart =
                Number(e.startTime.split(':')[0]) * 60 +
                Number(e.startTime.split(':')[1]);
              const eEnd =
                Number(e.endTime.split(':')[0]) * 60 +
                Number(e.endTime.split(':')[1]);

              e.daysOfWeek.forEach((day) => {
                if (day != this.convertDayToIndex(meeting.day)) return;

                const mStart = Number(meeting.startTime);
                const mEnd = Number(meeting.endTime);

                if (mStart < eEnd && mEnd > eStart) keep = false;
              });
            });
          });

          return keep;
        });
      });
    }
  }

  // Creates every possible combination of plans
  // Filters out any plan that has classes that conflict
  private generateCombos(plan: PlanData): { [key: string]: string }[] {
    const selectedSectionsCombo = [] as { [key: string]: string }[];

    let total = 1;
    const rollingProduct = [] as number[];

    const courses = plan.courses;

    if (!courses || courses.length == 0)
      throw new BadRequestException(
        'No courses selected. Please add a course to organize a schedule.',
      );

    for (const course of courses) {
      rollingProduct.push(total);
      total *= course.sections.length;
    }

    Logger.log(`\t - ${total} combinations`);

    // Loops through the total amount of combinations
    for (let i = 0; i < total; i++) {
      // Creates a section map of "class code": "section number" based on the current indexes
      const selectedSections = {} as { [key: string]: string };

      const meetings = [] as PlanDataMeetingTime[];

      let v = 0;
      for (const course of courses) {
        // Use an explicit formula to find the current combinations and add it's section number to the list and meetings to its list
        const index =
          Math.floor(i / rollingProduct[v]) % course.sections.length;

        course.sections[index].meetingTimes.forEach((m) => meetings.push(m));
        selectedSections[courses[v].code] =
          course.sections[index].sectionNumber;
        v++;
      }

      // If the currently made plan has a class time conflict, void it
      if (!this.verifyMeetings(meetings)) continue;

      selectedSectionsCombo.push(selectedSections);
    }

    return selectedSectionsCombo;
  }

  // Verifies if a list of MeetingTimes do not conflict with each other
  private verifyMeetings(meetings: PlanDataMeetingTime[]): boolean {
    // Compares every MeetingTime to every other MeetingTime
    for (let i = 0; i < meetings.length - 1; i++) {
      const meeting1 = meetings[i];
      for (let j = i + 1; j < meetings.length; j++) {
        const meeting2 = meetings[j];

        if (meeting1.day != meeting2.day) continue;

        const start1 = meeting1.startTime;
        const start2 = meeting2.startTime;
        const end1 = meeting1.endTime;
        const end2 = meeting2.endTime;

        if (start1 < end2 && end1 > start2) return false;
      }
    }

    return true;
  }

  // Converts a map of "class code": "section number" into a copy of the current plan, with the proper sections selected
  private convertSectionListToPlan(
    currentPlan: PlanData,
    sectionList: { [key: string]: string },
  ): PlanData {
    // Copies the current plan
    const newPlan = JSON.parse(JSON.stringify(currentPlan)) as PlanData;

    // Selects the sections as given in sectionList
    for (const [courseCode, section] of Object.entries(sectionList)) {
      const course = newPlan.courses?.find((c) => c.code == courseCode);
      course?.sections.forEach(
        (s) => (s.selected = s.sectionNumber == section),
      );
    }

    return newPlan;
  }

  // Rates and finds the best plan out of an list of section lists
  private findBestSections(
    allSectionLists: { [key: string]: string }[],
    plan: PlanData,
  ): { [key: string]: string }[] {
    // Scores all plans
    for (const sectionList of allSectionLists) {
      // @ts-expect-error Adding a temporary score value that will be removed later
      sectionList['score'] = this.rateSections(sectionList, plan);
    }

    // Sorts all plans
    // @ts-expect-error a['score'] is a number but the type doesn't say that
    allSectionLists.sort((a, b) => a['score'] - b['score']);
    console.log(allSectionLists.length, 'similar schedules');

    // Only return at most the top 5
    return allSectionLists.slice(0, 5);
  }

  // Converts the NJIT day scheme to an index (0 = Sunday)
  private convertDayToIndex(day: string): number {
    switch (day) {
      case 'U':
        return 0;
      case 'M':
        return 1;
      case 'T':
        return 2;
      case 'W':
        return 3;
      case 'R':
        return 4;
      case 'F':
        return 5;
      case 'S':
        return 6;
      default:
        return -1;
    }
  }

  private rateSections(
    sectionList: { [key: string]: string },
    plan: PlanData,
  ): number {
    const settings = plan.organizerSettings;

    const earliestStart = [1440, 1440, 1440, 1440, 1440, 1440, 1440]; // 60 minutes * 24 hours = 1440 minutes
    const latestEnd = [0, 0, 0, 0, 0, 0, 0];
    const totalClassTime = [0, 0, 0, 0, 0, 0, 0];

    // Make sure there's courses in the plan
    if (!plan.courses || plan.courses.length == 0) return -1;

    for (const course of plan.courses) {
      let section: PlanDataSection = {} as PlanDataSection;

      // Gets the selected section for that course
      for (const s of course.sections) {
        if (sectionList[course.code] == s.sectionNumber) section = s;
      }
      if (!section) continue;

      // Loops through each meeting of that day
      for (const meeting of section.meetingTimes) {
        // Gets the start and end time and sees if it earlier/later than our currently stored start/end time for that day
        const start = meeting.startTime;
        const end = meeting.endTime;

        const index = this.convertDayToIndex(meeting.day);

        earliestStart[index] = Math.min(earliestStart[index], Number(start));
        latestEnd[index] = Math.max(latestEnd[index], Number(end));
        totalClassTime[index] += Number(end) - Number(start);
      }
    }

    // Calculate different metrics to rate the schedule
    let score = 0;
    let days = 0;

    for (let dayOfWeekIndex = 0; dayOfWeekIndex < 7; dayOfWeekIndex++) {
      if (totalClassTime[dayOfWeekIndex] == 0) continue; // No classes on this day
      days++;

      const totalTimeOnCampus =
        latestEnd[dayOfWeekIndex] - earliestStart[dayOfWeekIndex];

      // Penalize schedules which spend more time on campus
      score += totalTimeOnCampus;

      // Penalize schedules that spend more than 70% of their time on campus in class (to promote breaks), only if compactPlan is off
      // Penalizes schedules in proportion to how much they take up the on campus time
      if (
        !settings.compactPlan &&
        totalClassTime[dayOfWeekIndex] > 3 * 60 &&
        totalTimeOnCampus * 0.7 < totalClassTime[dayOfWeekIndex]
      )
        score += (1000 * totalClassTime[dayOfWeekIndex]) / totalTimeOnCampus;
    }

    // Highly penalize schedules which go over the set amount of days on campus
    // Scales with the amount of days, so lower days are still prioritized
    if (settings.daysOnCampus && days > settings.daysOnCampus)
      score += 9999 * days;

    return score;
  }
}
