import { addRecentlyOpenedDocument } from "@/state/RecentlyOpenedDocuments";
import { useDocument, domain } from "@vega/documents";
import { MdSearch } from "react-icons/md";
import { Link } from "react-router-dom";

export function Navbar() {
  const { setOpenDocument: _setOpenDocument } = useDocument();

  const setOpenDocument = (
    document?: domain.Document & { nodes: domain.DocumentNode[] }
  ) => {
    _setOpenDocument(document);

    if (document) {
      addRecentlyOpenedDocument(document.id);
    }
  };

  return (
    <header className="w-full flex justify-between px-6 py-2 items-center border-b border-slate-200">
      <Link
        to="/"
        onClick={() => setOpenDocument(undefined)}
        className="  flex items-center gap-2"
      >
        <div
          className="bg-slate-800 w-8 h-8"
          style={{
            mask: "url(/logo.svg) center no-repeat",
            maskSize: "contain",
          }}
        />
        <h1 className="text-2xl font-semibold text-slate-800">Vega</h1>
      </Link>

      <div className="flex items-center rounded-md bg-slate-100 pl-3">
        <MdSearch className="text-xl text-gray-600" />
        <input
          type="search"
          placeholder="Buscar"
          className="w-full p-2 bg-transparent placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-2 py-1 px-3 bg-slate-50 rounded-md">
        <div className="rounded-full bg-slate-300 p-4 h-fit" />
        <div className="flex flex-col">
          <h3 className="text-sm text-slate-700">nome.sobrenome</h3>
          <select className="text-xs text-slate-500 bg-transparent rounded-md">
            <option value="">UFMS</option>
          </select>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
