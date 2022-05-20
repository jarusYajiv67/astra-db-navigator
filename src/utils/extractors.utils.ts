import {
  RegionSchema, CloudProviders, 
  KeyspaceSchema, TableSchema,
  TypeSchema, FieldSchema, ColumnSchema, IndexSchema
} from "./types";

export const extractDatabases = (reqBody: any): Array<string> => {
  const databases: Array<string> = [];
  for (let database of reqBody)
    databases.push(`${database.id}/${database.info.region}/${database.info.name}`);
  return databases;
};

export const extractRegions = (reqBody: any): RegionSchema => {
  const regions: RegionSchema = {AWS: [], GCP: []};
  for (let region of reqBody) {
    if (region.cloudProvider === "AZURE") continue;
    regions[region.cloudProvider as CloudProviders].push({
      name: region.name,
      displayName: region.displayName
    });
  }
  return regions;
};

export const extractKeyspaces = (reqBody: any): Array<KeyspaceSchema> => {
  const keyspaces: Array<KeyspaceSchema> = [];
  for (let keyspace of reqBody) 
    keyspaces.push({name: keyspace.name, dataCenters: keyspace?.datacenters?.length || '-'});
  return keyspaces;
};

export const extractTables = (reqBody: any): Array<TableSchema> => {
  const tables: Array<TableSchema> = [];
  for (let table of reqBody)
    tables.push({name: table.name, columns: table.columnDefinitions.length});
  return tables;
};

export const extractTypes = (reqBody: any): Array<TypeSchema> => {
  const types: Array<TypeSchema> = [];
  for (let val of reqBody)
    types.push({name: val.name, fields: val.fields.length});
  return types;
};

export const extractFields = (reqFields: any): Array<FieldSchema> => {
  const fields: Array<FieldSchema> = [];
  for (let field of reqFields)
    fields.push({name: field.name, type: field.typeDefinition});
  return fields;
};

export const extractColumns = (reqColumns: any): Array<ColumnSchema> => {
  const columns: Array<ColumnSchema> = [];
  for (let column of reqColumns)
    columns.push({name: column.name, static: column.static, type: column.typeDefinition});
  return columns;
};

const filteredOptions = (options: Array<any>): Array<string> => {
  const realOptions = options.filter(({key}) => key !== 'class_name');
  return realOptions.map(({value}) => value);
};

export const extractIndices = (reqIndices: any): Array<IndexSchema> => {
  const indices: Array<IndexSchema> = [];
  for (let index of reqIndices)
    indices.push({name: index.index_name, kind: index.kind, options: filteredOptions(index.options)});
  return indices;
};
