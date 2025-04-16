import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { Section } from 'schemas/sections.schema';

@Injectable()
export class BulkCrnsService {
  constructor(
    @InjectModel(Section.name)
    private sectionModel: Model<Section>,
  ) {}
  async findBulkCrns(crnArr: string[], term: string) {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          CRN: { $in: crnArr },
          TERM: term,
        },
      },
      {
        $lookup: {
          from: "Sections", // Look in the "Sections" collection
          localField: "COURSE", // Match the "COURSE" field in the current document
          foreignField: "COURSE", // With the "COURSE" field in the "Sections" collection
          as: "relatedCourses", // Store the result in "relatedCourses"
        },
      },
      {
        $unwind: "$relatedCourses",
      },
      {
        $match: {
          "relatedCourses.TERM": term,
        },
      },
      {
        $replaceRoot: {
          newRoot: "$relatedCourses",
        },
      },
      {
        $sort: { COURSE: 1 },
      },
      {
        $group: {
          _id: "$COURSE",
          title: { $first: "$TITLE" },
          credits: { $first: "$CREDITS" },
          sections: { $push: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "Course_Static", // Look in the "Course_Static" collection
          localField: "_id", // Match the "_id" field in the current document
          foreignField: "_id", // With the "_id" field in the "Course_Static" collection
          as: "course_static",
        },
      },
      {
        $addFields: {
          description: {
            $arrayElemAt: ["$course_static.description", 0],
          },
        },
      },
      {
        $unset: "course_static", // Remove the "course_static" field from the result
      }
    ];
    const sections = await this.sectionModel.aggregate(pipeline);
    const countofSections = sections.length;
    if (countofSections === 0) {
      throw new Error('No sections were found for the given CRNs');
    }
    return sections;
  }
}
