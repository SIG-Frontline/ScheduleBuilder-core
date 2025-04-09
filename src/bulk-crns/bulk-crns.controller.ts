import { Body, Controller, Param, Post } from '@nestjs/common';
import { BulkCrnsService } from './bulk-crns.service';

@Controller('bulk-crns')
export class BulkCrnsController {
  constructor(private readonly BulkCrnsService: BulkCrnsService) {}
  //a note to someone else trying to get this to work... it needs Content-Type: application/json in the header
  //Also since the api docs are not set up for this yet, the below decorators are commented out
  @Post('/:term')
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
