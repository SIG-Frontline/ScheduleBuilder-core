import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MeetingTime, PlanData, Section } from 'src/utils/types.util';

@Injectable()
export class OrganizerService {
  constructor() {}

  /**
   * Accepts a plan to organize. It will then return a plan which is scored to be the "most optimal"
   *
   * @param currentPlan The currently selected plan to organize
   * @returns A Plan object with the most optimal schedule generated based on the 'rateSections' function, undefined if none can be generated with the given inputs
   */
  async organizePlan(currentPlan: PlanData): Promise<PlanData> {
    // Copy the plan so we can modify some values without changing the underlying data
    const copyPlan = (await JSON.parse(
      JSON.stringify(currentPlan),
    )) as PlanData;

    console.log('\nStarting optimizer...');
    const start = Date.now();

    // Filters all the sections in the current plan in place
    this.filterSectionsInPlan(copyPlan);

    // Generate all possible schedule combinations as plans
    const allPossibleSectionCombos = this.generateCombos(copyPlan);

    if (allPossibleSectionCombos.length == 0)
      throw new NotFoundException('No valid schedules can be made');

    // Rank the plans using rateSections()
    const bestSections = this.findBestSections(
      allPossibleSectionCombos,
      copyPlan,
    );
    const bestPlan = this.convertSectionListToPlan(currentPlan, bestSections);
    console.log((Date.now() - start) / 1000, 's in total\n');

    // Return most optimal schedule
    return bestPlan;
  }

  // Filters out sections that do not match the specified filters
  private filterSectionsInPlan(plan: PlanData): void {
    // TODO: filter sections that interfere with events
    // TODO: filter sections that have a full seat count

    const courseFilters = plan.organizerSettings.courseFilters;

    // Perform all the filters for the courses
    for (const filter of courseFilters) {
      plan.courses?.forEach((course) => {
        if (course.code !== filter.courseCode) return;

        course.sections = course.sections.filter(
          (s) =>
            ((filter.instructor == null || s.INSTRUCTOR == filter.instructor) &&
              (filter.honors == null || s.IS_HONORS == filter.honors) &&
              // Do some weird conditionals because we don't know if the sections are in sync with the new schema
              (filter.online == null ||
                (s['INSTURCTION_METHOD']
                  ? s['INSTRUCTION_METHOD']
                      .toLowerCase()
                      .includes(filter.online)
                  : s.INSTRUCTION_METHOD.toLowerCase().includes(
                      filter.online,
                    ))) &&
              filter.section == null) ||
            s.SECTION == filter.section,
        );
      });
    }

    // Modify all meeting time strings to be minutes from midnight for much easier math (and avoid multiple conversions with Date)
    plan.courses?.forEach((c) =>
      c.sections.forEach((s) =>
        s.TIMES.forEach((m) => {
          // @ts-expect-error Changing ISO string to a number
          m.start =
            new Date(m.start).getHours() * 60 + new Date(m.start).getMinutes();
          // @ts-expect-error Changing ISO string to a number
          m.end =
            new Date(m.end).getHours() * 60 + new Date(m.end).getMinutes();
        }),
      ),
    );

    // Remove extra online sections while generating
    // If a course has 10 online sections, it might as well only have 1
    // NOTE: this optimization might be removed later
    const hasOnline: { [key: string]: boolean } = {};

    plan.courses?.forEach((course) => {
      for (let i = 0; i < course.sections.length; i++) {
        const s = course.sections[i];

        if (s.TIMES.length == 0) {
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
  }

  // Creates every possible combination of plans
  // Filters out any plan that has classes that conflict
  private generateCombos(plan: PlanData): { [key: string]: string }[] {
    const selectedSectionsCombo = [] as { [key: string]: string }[];

    let total = 1;
    const rollingProduct = [] as number[];

    const courses = plan.courses;

    if (!courses || courses.length == 0)
      throw new BadRequestException('No courses selected');

    for (const course of courses) {
      rollingProduct.push(total);
      total *= course.sections.length;
    }

    console.log(total, 'possible schedules');

    // Loops through the total amount of combinations
    for (let i = 0; i < total; i++) {
      // Creates a section map of "class code": "section number" based on the current indexes
      const selectedSections = {} as { [key: string]: string };

      const meetings = [] as MeetingTime[];

      let v = 0;
      for (const course of courses) {
        // Use an explicit formula to find the current combinations and add it's section number to the list and meetings to its list
        const index =
          Math.floor(i / rollingProduct[v]) % course.sections.length;

        course.sections[index].TIMES.forEach((m) => meetings.push(m));
        selectedSections[courses[v].code] = course.sections[index].SECTION;
        v++;
      }

      // If the currently made plan has a class time conflict, void it
      if (!this.verifyMeetings(meetings)) continue;

      selectedSectionsCombo.push(selectedSections);
    }

    return selectedSectionsCombo;
  }

  // Verifies if a list of MeetingTimes do not conflict with each other
  private verifyMeetings(meetings: MeetingTime[]): boolean {
    // Compares every MeetingTime to every other MeetingTime
    for (let i = 0; i < meetings.length - 1; i++) {
      const meeting1 = meetings[i];
      for (let j = i + 1; j < meetings.length; j++) {
        const meeting2 = meetings[j];

        if (meeting1.day != meeting2.day) continue;

        const start1 = meeting1.start;
        const start2 = meeting2.start;
        const end1 = meeting1.end;
        const end2 = meeting2.end;

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
      course?.sections.forEach((s) => (s.selected = s.SECTION == section));
    }

    return newPlan;
  }

  // Rates and finds the best plan out of an list of section lists
  private findBestSections(
    allSectionLists: { [key: string]: string }[],
    plan: PlanData,
  ): { [key: string]: string } {
    let bestScore = 999999999;
    let bestSectionList = {} as { [key: string]: string };
    let count = 0;

    // Ranks all plans to determine which has the smallest score
    for (const sectionList of allSectionLists) {
      const score = this.rateSections(sectionList, plan);
      if (score == -1) continue;

      if (score < bestScore) {
        bestScore = score;
        bestSectionList = sectionList;
        count = 1;
      }
      if (score == bestScore) {
        count++;
      }
    }

    console.log(count, 'similar schedules!');
    return bestSectionList;
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
      let section: Section = {} as Section;

      // Gets the selected section for that course
      for (const s of course.sections) {
        if (sectionList[course.code] == s.SECTION) section = s;
      }
      if (!section) continue;

      // Loops through each meeting of that day
      for (const meeting of section.TIMES) {
        // Gets the start and end time and sees if it earlier/later than our currently stored start/end time for that day
        const start = meeting.start;
        const end = meeting.end;

        const index = this.convertDayToIndex(meeting.day);

        // @ts-expect-error String was changed to a number earlier
        earliestStart[index] = Math.min(earliestStart[index], start);
        // @ts-expect-error String was changed to a number earlier
        latestEnd[index] = Math.max(latestEnd[index], end);
        // @ts-expect-error String was changed to a number earlier
        totalClassTime[index] += end - start;
      }
    }

    // Calculate different metrics to rate the schedule
    let score = 0;

    for (let i = 0; i < 7; i++) {
      if (totalClassTime[i] == 0) continue; // No classes on this day

      const totalTimeOnCampus = latestEnd[i] - earliestStart[i];

      // Penalize schedules which spend more time on campus
      score += totalTimeOnCampus;

      // Compensate for commute time (which can reduce amount of days on campus)
      if (settings.isCommuter) score += settings.commuteTimeHours * 60;

      // Penalize schedules that spend more than 70% of their time on campus in class (to promote breaks), only if compactPlan is off
      // Penalizes schedules in proportion to how much they take up the on campus time
      if (
        !settings.compactPlan &&
        totalClassTime[i] > 3 * 60 &&
        totalTimeOnCampus * 0.7 < totalClassTime[i]
      )
        score += (1000 * totalClassTime[i]) / totalTimeOnCampus;
    }

    return score;
  }
}
