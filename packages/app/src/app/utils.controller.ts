import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Put,
} from '@nestjs/common';
import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';

const JSON_FILE = join('flags.json');
const JSON_SCHEMA_FILE = join('schemas', 'flag.schema.json');

/**
 * Controller for reading/writing JSON for the JSON file provider.
 */
@Controller('utils')
export class UtilsController {
  /**
   * Read JSON to populate editor
   * @returns JSON flag config
   */
  @Get('schema')
  async getSchema() {
    return await (await readFile(JSON_SCHEMA_FILE)).toString();
  }

  /**
   * Read JSON to populate editor
   * @returns JSON flag config
   */
  @Get('json')
  async getJson() {
    return await (await readFile(JSON_FILE)).toString();
  }

  /**
   * Write JSON from editor
   * @param body JSON flag config
   */
  // TODO we could add schema validation here, but probably more important in the UI.
  @Put('json')
  async putJson(@Body() body: unknown) {
    try {
      JSON.parse(JSON.stringify(body));
    } catch (err) {
      throw new BadRequestException('Invalid JSON');
    }
    try {
      await writeFile(JSON_FILE, JSON.stringify(body));
    } catch (err) {
      throw new InternalServerErrorException('Unable to write JSON file.');
    }
  }
}
