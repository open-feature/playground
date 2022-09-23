import { BadRequestException, Body, Controller, Get, InternalServerErrorException, Put } from '@nestjs/common';
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
    return (
      await readFile(JSON_FILE).catch((err) => {
        // if this file isn't found, it's because we aren't running the JSON provider
        if (err?.code === 'ENOENT') {
          return '{}';
        }
        throw err;
      })
    ).toString();
  }

  /**
   * Return the provider
   * @returns provider object
   */
  @Get('provider')
  async getProvider() {
    return {
      provider: process.argv[2],
    };
  }

  /**
   * Write JSON from editor
   * @param body JSON flag config
   */
  @Put('json')
  async putJson(@Body() body: unknown) {
    try {
      JSON.parse(JSON.stringify(body));
    } catch (err) {
      throw new BadRequestException('Invalid JSON');
    }
    try {
      await writeFile(JSON_FILE, JSON.stringify(body, null, 2));
    } catch (err) {
      throw new InternalServerErrorException('Unable to write JSON file.');
    }
  }
}
