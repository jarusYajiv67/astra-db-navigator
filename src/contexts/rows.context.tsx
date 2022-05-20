import React, {createContext, ReactNode, useContext, useState} from "react";
import axios from "axios";
import toast from "react-hot-toast";

import {RowType} from '../utils/types';
import {getDummyRows} from '../utils/row.utils';

import {useConnectionContext} from './connection.context';
import {useDatabaseContext} from './database.context';
import {useKeyspaceContext} from './keyspace.context';
import {useTableContext} from './table.context';

interface RowsContextInterface {
  columns: Array<string>;
  resColumns: Array<string>;
  currColumn: string;
  pageSize: string;
  rows: Array<RowType>;
  page: string | null;
  showRow: boolean;
  fetchColumns?: (tblName: string) => void;
  fetchRows?: (fromFilter?: boolean) => void;
  setCurrColumn?: (val: string) => void;
  setPageSize?: (val: string) => void;
  addColumn?: () => void;
  removeColumn?: (colName: string) => void;
  resetState?: () => void;
  deleteRow?: (idx: number) => void;
  setShowRow?: (val: boolean) => void;
}

const defaultState: RowsContextInterface = {
  columns: [],
  resColumns: [],
  currColumn: '',
  pageSize: '5',
  rows: [],
  page: "",
  showRow: false
};

export const RowsContext = createContext<RowsContextInterface>(defaultState);

export const useRowsContext = () => useContext(RowsContext);

export const RowsContextProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const {setLoading, appToken: tkn} = useConnectionContext();
  const {currDatabase} = useDatabaseContext();
  const {currKeyspace} = useKeyspaceContext();
  const {currTable} = useTableContext();

  const [columns, setColumns] = useState<Array<string>>(defaultState.columns);
  const [resColumns, setResColumns] = useState<Array<string>>(defaultState.resColumns);
  const [currColumn, setCurrColumn] = useState<string>(defaultState.currColumn);
  const [pageSize, setPageSize] = useState<string>(defaultState.pageSize);
  const [rows, setRows] = useState<Array<RowType>>(defaultState.rows);
  const [page, setPage] = useState<string | null>(defaultState.page);
  const [showRow, setShowRow] = useState<boolean>(defaultState.showRow);

  const fetchColumns = (tableName: string) => {
    if (tableName.length < 1) return;
    setLoading!(true);
    axios
      .post("/.netlify/functions/fetch-columns", {
        tkn,
        dbId: currDatabase.split("/")[0],
        dbRegion: currDatabase.split("/")[1],
        ksName: currKeyspace?.name,
        tableName,
      })
      .then(({ data }) => {
        const availColumns = data.map(({ name }: { name: string }) => name);
        setColumns(availColumns);
        setCurrColumn(availColumns[0]);
        setLoading!(false);
      })
      .catch((err) => {
        setLoading!(false);
        toast.error(err.response.data);
      });
  };

  const addColumn = () => {
    if (columns.length < 1) return;
    setResColumns([...resColumns, currColumn]);
    const nc: Array<string> = columns.filter((val) => val !== currColumn);
    setColumns(nc);
    setCurrColumn(nc[0]);
  };

  const removeColumn = (colName: string) => {
    setResColumns(resColumns.filter((val) => val !== colName));
    setColumns([...columns, colName]);
  };

  const fetchRows = (fromFilter: boolean = false) => {
    if (page === null) return;
    setLoading!(true);
    const defaultReqBody = {
      tkn,
      dbId: currDatabase.split("/")[0],
      dbRegion: currDatabase.split("/")[1],
      ksName: currKeyspace?.name,
      tableName: currTable?.name,
    };
    const reqBody = {
      fields: resColumns.join(),
      "page-size": +pageSize,
    };
    if (fromFilter) {
      axios.post(`/.netlify/functions/fetch-rows`, {...defaultReqBody, reqBody})
      .then(({data}) => {
        setRows(data);
        setPage("");
        setLoading!(false);
      });
    }
    else {
      if (rows.length > 0) {
        console.log("pagination");
        setRows([...rows, ...getDummyRows(resColumns, +pageSize)]);
        setPage("");
        setLoading!(false);
      }
      else {
        console.log("first fetch");
        setRows(getDummyRows(resColumns, +pageSize));
        setPage("");
        setLoading!(false);
      }
    }
  };

  const deleteRow = (idx: number) => {
    setLoading!(true);
    setTimeout(() => {
      setRows(rows.filter((_, index) => index !== idx));
      setLoading!(false);
    }, 500);
  };

  const resetState = () => {
    setColumns(defaultState.columns);
    setResColumns(defaultState.resColumns);
    setCurrColumn(defaultState.currColumn);
    setPageSize(defaultState.pageSize);
    setRows(defaultState.rows);
    setPage(defaultState.page);
    setShowRow(defaultState.showRow);
  };

  return (
    <RowsContext.Provider value={{
      columns, resColumns, currColumn, pageSize, 
      rows, page, showRow,
      fetchColumns, setCurrColumn, addColumn,
      removeColumn, setPageSize, fetchRows,
      resetState, deleteRow, setShowRow
    }}>{children}</RowsContext.Provider>
  );
};
