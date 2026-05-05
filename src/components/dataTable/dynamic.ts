import dynamic from "next/dynamic";
import type { DataTableProps } from "./index";

export const DataTable = dynamic(
  () => import("./index").then((mod) => mod.DataTable),
  { ssr: false },
) as <T>(props: DataTableProps<T>) => React.ReactElement;
