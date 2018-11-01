import { Collection } from 'discord.js';
import WrapperError from '../../util/WrapperError';

/**
 * A provider for key-value storage.
 * Must be implemented.
 */
export class Provider {
  /**
   * Cached entries.
   * @type {Collection<string, Object>}
   */
  public items: Collection<string, object>
  public constructor() {
    this.items = new Collection();
  }

  /**
   * Initializes the provider.
   * @abstract
   * @returns {any} Must be Implemented
   */
  public init(): any {
    throw new WrapperError('NOT_IMPLEMENTED', this.constructor.name, 'init');
  }

  /**
   * Gets a value.
   * @abstract
   * @param {string} id - ID of entry.
   * @param {string} key - The key to get.
   * @param {any} [defaultValue] - Default value if not found or null.
   * @returns {any} Must be Implemented
   */
  public get(id: string,key: string,defaultValue?: any): any {
    throw new WrapperError('NOT_IMPLEMENTED', this.constructor.name, 'get');
  }

  /**
   * Sets a value.
   * @abstract
   * @param {string} id - ID of entry.
   * @param {string} key - The key to set.
   * @param {any} value - The value.
   * @returns {any} Must be Implemented
   */
  public set(id: string,key: string,value: any): any {
    throw new WrapperError('NOT_IMPLEMENTED', this.constructor.name, 'set');
  }

  /**
   * Deletes a value.
   * @abstract
   * @param {string} id - ID of entry.
   * @param {string} key - The key to delete.
   * @returns {any} Must be Implemented
   */
  public delete(id: string,key: string): any {
    throw new WrapperError('NOT_IMPLEMENTED', this.constructor.name, 'delete');
  }

  /**
   * Clears an entry.
   * @abstract
   * @param {string} id - ID of entry.
   * @returns {any} Must be Implemented
   */
  public clear(id: string): any {
    throw new WrapperError('NOT_IMPLEMENTED', this.constructor.name, 'clear');
  }
}

/**
 * Options to use for providers.
 * @typedef {Object} ProviderOptions
 * @prop {string} [idColumn='id'] - Column for the unique key, defaults to 'id'.
 * @prop {string} [dataColumn] - Column for JSON data.
 * If not provided, the provider will use all columns of the table.
 * If provided, only one column will be used, but it will be more flexible due to being parsed as JSON.
 * For Sequelize, note that the model has to specify the type of the column as JSON or JSONB.
 */
export type ProviderOptions = {
  idColumn?: string;
  dataColumn?: string;
};