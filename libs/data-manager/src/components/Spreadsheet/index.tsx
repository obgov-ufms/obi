import {
  Fragment,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { range } from "remeda";
import { numberToLetters, gridTemplateRule } from "./util";
import classNames from "classnames";

type CursorPosition = readonly [row: number, col: number];
type ColInfo = readonly [
  i: number,
  letters: string,
  dataKey: string | number | symbol
];
// type EditMap = Record<number, Record<number, any>>;
type SelectionMap = {
  col: Record<number, true>;
  row: Record<number, true>;
  cell: Record<string, true>;
};

const selectionMapInitialState = {
  col: {},
  row: {},
  cell: {},
};

const selectionMapIsEmpty = (selectionMap: SelectionMap) =>
  Object.keys(selectionMap.cell).length === 0 &&
  Object.keys(selectionMap.row).length === 0 &&
  Object.keys(selectionMap.col).length === 0;

export function Spreadsheet(props: {
  data: unknown[];
  colType?: "letters" | "keys";
  functionBar?: boolean;
}) {
  const { data: initialData, colType = "letters" } = props;

  const [data, setData] = useState<any[]>(initialData);

  const [selectionMap, setSelectionMap] = useState<SelectionMap>({
    ...selectionMapInitialState,
    cell: { "0-0": true as const },
  });

  const [cursor, setCursor] = useState<CursorPosition>([0, 0]);
  const [editMode, setEditMode] = useState(false);

  const keys = Object.keys(data?.[0] ?? {}) as (keyof typeof data[number])[];

  const cols = useMemo(
    () =>
      range(0, keys.length).map(
        (i) => [i, numberToLetters(i), keys[i]] as ColInfo
      ),
    [keys.length]
  );
  const rows = useMemo(() => range(0, data.length), [data.length]);

  const getCellData = ([row, col]: CursorPosition) => data[row][keys[col]];
  const isCellEditMode = (cellPosition: CursorPosition) =>
    editMode && cursor[0] === cellPosition[0] && cursor[1] === cellPosition[1];
  const isCursorAtCell = (cellPosition: CursorPosition) =>
    cursor[0] === cellPosition[0] && cursor[1] === cellPosition[1];
  const isCellSelected = ([row, col]: CursorPosition) =>
    selectionMap.col[col] ||
    selectionMap.row[row] ||
    selectionMap.cell[`${row}-${col}`];

  const onCellSetCursor =
    ([row, col]: CursorPosition): React.MouseEventHandler<HTMLDivElement> =>
    (ev) => {
      if (!ev.shiftKey) {
        setSelectionMap(selectionMapInitialState);
      }

      setSelectionMap((state) => ({
        ...state,
        cell: { ...state.cell, [`${row}-${col}`]: true },
      }));

      setCursor([row, col]);
    };

  const functionBarOnChange: React.ChangeEventHandler<HTMLInputElement> = (
    ev
  ) =>
    setData((state) =>
      state.map((data, i) =>
        i === cursor[0] ? { ...data, [keys[cursor[1]]]: ev.target.value } : data
      )
    );

  const functionBarOnFocus: React.ChangeEventHandler<HTMLInputElement> = () => {
    setEditMode(true);
  };

  const functionBarOnBlur: React.ChangeEventHandler<HTMLInputElement> = () => {
    setEditMode(false);
  };

  const functionBarOnKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    ev
  ) => {
    if (editMode) {
      if (ev.key === "Enter") {
        ev.preventDefault();
        setCursor((state) => [
          Math.min(state[0] + 1, rows.length - 1),
          state[1],
        ]);
      } else if (ev.key === "Tab") {
        ev.preventDefault();
        setCursor((state) => [
          state[0],
          Math.min(state[1] + 1, cols.length - 1),
        ]);
      }
    }
  };

  const onColSelect =
    (col: number): React.MouseEventHandler<HTMLDivElement> =>
    (ev) => {
      setCursor([0, col]);

      if (ev.shiftKey || selectionMapIsEmpty(selectionMap)) {
        setSelectionMap((state) => ({
          ...state,
          row: {},
          col: { ...state.col, [col]: true },
        }));
      } else {
        setSelectionMap({
          ...selectionMapInitialState,
          col: { [col]: true },
        });
      }
    };

  const onRowSelect =
    (row: number): React.MouseEventHandler<HTMLDivElement> =>
    (ev) => {
      setCursor([row, 0]);

      if (ev.shiftKey || selectionMapIsEmpty(selectionMap)) {
        setSelectionMap((state) => ({
          ...state,
          col: {},
          row: { ...state.row, [row]: true },
        }));
      } else {
        setSelectionMap({
          ...selectionMapInitialState,
          row: { [row]: true },
        });
      }
    };

  const onAddNewRow = () => setData((state) => [...state, {}]);
  const onAddNewCol = () =>
    setData((state) => state.map((data) => ({ ...data, key: undefined })));

  return (
    <div className="flex items-center justify-center flex-col gap-2 bg-slate-200 rounded-b-lg">
      <FunctionBar
        value={getCellData(cursor)}
        onChange={functionBarOnChange}
        cursor={cursor}
        editMode={editMode}
        onKeyDown={functionBarOnKeyDown}
        onFocus={functionBarOnFocus}
        onBlur={functionBarOnBlur}
        colType={colType}
        keys={keys}
        show={props.functionBar}
      />

      <div className="grid w-full" style={{ gridTemplateColumns: "1fr 4rem" }}>
        <Sheet
          rowsNumber={rows.length}
          colsNumber={cols.length}
          onEnterEditMode={() => setEditMode(true)}
          onExitEditMode={() => setEditMode(false)}
        >
          <SheetHandle />
          {cols.map((col) => (
            <ColHeader
              key={`col-${col[1]}`}
              col={
                colType === "keys" ? (keys[col[0]] as string | number) : col[1]
              }
              onSelect={onColSelect(col[0])}
              selected={selectionMap.col[col[0]]}
            />
          ))}
          {rows.map((row) => (
            <Fragment key={`row-${row}`}>
              <RowHeader
                row={row + 1}
                onSelect={onRowSelect(row)}
                selected={selectionMap.row[row]}
              />
              {cols.map(([col]) => (
                <Cell
                  key={`cell-${row}-${col}`}
                  selected={isCellSelected([row, col])}
                  isCursorAt={isCursorAtCell([row, col])}
                  onSetCursor={onCellSetCursor([row, col])}
                  editMode={isCellEditMode([row, col])}
                  data={getCellData([row, col])}
                />
              ))}
            </Fragment>
          ))}
        </Sheet>
        <button
          className="h-full flex items-center justify-center bg-slate-200 text-slate-500 border border-l-0 border-slate-300 py-2 px-4 text-xs uppercase select-none hover:bg-slate-300/70"
          onClick={onAddNewCol}
        >
          +
        </button>
        <button
          className="w-full flex items-center justify-center bg-slate-200 text-slate-500 border border-t-0 border-slate-300 py-2 px-4 text-xs uppercase select-none rounded-bl-lg hover:bg-slate-300/70"
          onClick={onAddNewRow}
        >
          +
        </button>
        <button
          className="h-full flex items-center justify-center bg-slate-200 text-slate-500 border border-l-0 border-t-0 border-slate-300 py-2 px-4 text-xs uppercase select-none rounded-br-lg hover:bg-slate-300/70"
          onClick={() => {
            onAddNewCol();
            onAddNewRow();
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

function FunctionBar(props: {
  cursor: CursorPosition;
  value: React.InputHTMLAttributes<HTMLInputElement>["value"];
  onChange: React.InputHTMLAttributes<HTMLInputElement>["onChange"];
  onKeyDown: React.InputHTMLAttributes<HTMLInputElement>["onKeyDown"];
  onFocus: React.InputHTMLAttributes<HTMLInputElement>["onFocus"];
  onBlur: React.InputHTMLAttributes<HTMLInputElement>["onBlur"];
  editMode: boolean;
  colType: "letters" | "keys";
  keys: (string | number | symbol)[];
  show?: boolean;
}) {
  const {
    cursor,
    value,
    onChange,
    editMode,
    onKeyDown,
    onFocus,
    onBlur,
    colType,
    keys,
    show,
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current !== null && editMode === true) {
      // inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editMode, cursor]);

  const cursorInfo =
    colType === "keys"
      ? `${cursor[0] + 1}.${String(keys[cursor[1]])}`
      : `${numberToLetters(cursor[1]).toUpperCase()}${cursor[0] + 1}`;

  return (
    <div
      className={classNames(
        "w-full grid",
        !show && "opacity-0 absolute -top-[999rem]"
      )}
      style={{ gridTemplateColumns: "8rem 1fr" }}
    >
      <div className="text-sm font-mono text-center flex items-center justify-center text-slate-700 h-full bg-white border border-slate-200">
        {cursorInfo}
      </div>
      <input
        className={`h-full pl-6 py-1 flex-1 bg-white border border-l-0 border-slate-200 resize-none ${
          value?.toString().startsWith("=") && "font-mono text-blue-800"
        }`}
        ref={inputRef}
        value={value ?? ""}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <div className="flex items-center justify-center select-none bg-yellow-100 border border-t-0 border-slate-200 w-full text-xs font-mono text-slate-500 py-1">
        {typeof value}
      </div>
    </div>
  );
}

function Sheet(
  props: PropsWithChildren<{
    rowsNumber: number;
    colsNumber: number;
    onEnterEditMode: () => void;
    onExitEditMode: () => void;
  }>
) {
  const { rowsNumber, colsNumber, onEnterEditMode, onExitEditMode, children } =
    props;

  return (
    <div
      className="grid divide-x divide-y divide-slate-300 border-b border-r border-slate-300"
      style={{
        gridTemplateRows: gridTemplateRule(rowsNumber + 1),
        gridTemplateColumns: gridTemplateRule(colsNumber + 1),
      }}
      onDoubleClick={onEnterEditMode}
      onMouseDown={onExitEditMode}
    >
      {children}
    </div>
  );
}

function SheetHandle() {
  return (
    <div className="hover:bg-slate-300/70 bg-slate-200 border-l border-t border-slate-300" />
  );
}

function Cell(props: {
  editMode: boolean;
  isCursorAt: boolean;
  selected: boolean;
  data: any;
  onSetCursor: React.DOMAttributes<HTMLDivElement>["onMouseDown"];
}) {
  const { onSetCursor, editMode, isCursorAt, selected, data } = props;

  return (
    <div
      className={`flex items-center overflow-hidden  transition-all ${
        editMode && "drop-shadow-md min-w-fit"
      } p-2 select-none ${isCursorAt && "ring ring-inset ring-yellow-200"} ${
        selected ? "bg-yellow-50" : "bg-white"
      }`}
      onMouseDown={onSetCursor}
    >
      {data}
    </div>
  );
}

function ColHeader(props: {
  col: string | number;
  onSelect: React.DOMAttributes<HTMLDivElement>["onMouseDown"];
  selected: boolean;
}) {
  const { col, onSelect, selected } = props;

  return (
    <div
      className={`relative flex items-center justify-center bg-slate-200 text-slate-500 p-2 text-xs uppercase select-none ${
        selected && "bg-yellow-400"
      }`}
      onMouseDown={onSelect}
      onContextMenu={(ev) => ev.preventDefault()}
    >
      {col}
      <ColResizeHandle />
    </div>
  );
}

function RowHeader(props: {
  row: number;
  onSelect: React.DOMAttributes<HTMLDivElement>["onMouseDown"];
  selected: boolean;
}) {
  const { row, selected, onSelect } = props;

  return (
    <div
      className={`relative text-center bg-slate-200 text-slate-500 flex items-center justify-center p-3 text-xs select-none ${
        selected && "bg-yellow-400"
      }`}
      onMouseDown={onSelect}
      onContextMenu={(ev) => ev.preventDefault()}
    >
      {row}
      <RowResizeHandle />
    </div>
  );
}

function RowResizeHandle() {
  return (
    <div className="absolute w-full -bottom-2 z-[1] cursor-row-resize py-2" />
  );
}

function ColResizeHandle() {
  return (
    <div className="absolute h-full -right-2 z-[1] cursor-col-resize px-2" />
  );
}
