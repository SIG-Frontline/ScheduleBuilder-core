import { Body, Controller, Param, Get, Query } from '@nestjs/common';
import { BulkCrnsService } from './bulkCRNs.service';
import { Section } from 'schemas/sections.schema';
// import { ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';
@Controller('bulk-crns')
export class BulkCrnsController {
  constructor(private readonly BulkCrnsService: BulkCrnsService) {}

  //a note to someone else trying to get this to work... it needs Content-Type: application/json in the header
  //Also since the api docs are not set up for this yet, the below decorators are commented out
  @Get()
  async findSectionsByCrn(
    @Query('term') term: string,
    @Query() query: Record<string, string>,
  ): Promise<Section[]> {
    const crns: string[] = [];
    for (const key in query) {
      if (key.startsWith('crn')) {
        crns.push(query[key]); // expects a string but isn't
      }
    }
    return this.BulkCrnsService.findBulkCrns(crns, term);
  }

  // @ApiOkResponse({ description: 'Sections were returned successfully' })
  // @ApiOperation({
  //   summary: 'Get bulk sections by CRN',
  //   description: `When given a list of CRNs (in the request body) and a term (in the url), this endpoint will return the sections for those CRNs.`,
  // })
  // @ApiResponse({
  //   status: 404,
  //   description: 'No sections were found for the given CRNs',
  // })
  async createCRNs(@Param('term') term: string, @Body() body: string[]) {
    return await this.BulkCrnsService.findBulkCrns(body, term);
  }
}
