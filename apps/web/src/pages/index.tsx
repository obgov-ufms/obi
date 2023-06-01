import { Document, useDocument } from "@vega/documents";
import Accordion from "@/components/Accordion";
import { MdApartment, MdSearch } from "react-icons/md";
import { useStore } from "@nanostores/react";
import { organizations } from "@/state/OrganizationStore";
import classnames from "classnames";
import { documents } from "@/state/DocumentStore";
import { documentNodes } from "@/state/DocumentNodeStore";

function OrganizationsAccordion() {
  const organizationsStore = useStore(organizations);
  const documentsStore = useStore(documents)
  const documentNodesStore = useStore(documentNodes)

  const { openDocument, setOpenDocument } = useDocument();

  return (
    <div className="pl-8">
      <Accordion
        items={organizationsStore.map((organization) => ({
          id: organization.id,
          title: (
            <h4 className="text-slate-700 text-sm p-3">{organization.name}</h4>
          ),
          open: true,
          content: (
            <div className="pl-2 flex flex-col gap-2">
              {documentsStore
                .filter(
                  ({ organizationId }) => organizationId === organization.id
                )
                .map((document) => (
                  <button
                    onClick={() => setOpenDocument({
                      ...document,
                      nodes: documentNodesStore.filter(({ documentId }) => documentId === document.id)
                    })}
                    key={document.id}
                    className={classnames(
                      "text-left text-sm bg-slate-50 p-2 rounded-lg text-slate-500",
                      openDocument?.id === document.id
                        ? "bg-slate-200"
                        : "hover:bg-slate-100"
                    )}
                  >
                    {document.name}
                  </button>
                ))}
            </div>
          ),
        }))}
      />
    </div>
  );
}

export function HomePage() {
  return (
    <div className="w-screen h-screen flex">
      <aside className="bg-white border-r border-slate-200 h-full w-64 flex flex-col gap-2 py-4">
        <h1 className="text-3xl font-semibold py-3 px-6 text-slate-800">
        Vega
        </h1>
        <div className="flex flex-col gap-2 pr-4">
          <Accordion
            items={[
              {
                id: "organizacoes",
                title: (
                  <div className="flex items-center gap-2 p-4">
                    <MdApartment className="text-slate-500 text-lg" />
                    <h3 className="text-slate-700">Organizações</h3>
                  </div>
                ),
                open: true,
                content: <OrganizationsAccordion />,
              },
            ]}
          />
        </div>
      </aside>
      <main className="bg-slate-50 h-full flex-1 flex flex-col">
        <header className="w-full h-1/12 bg-white border-b border-slate-200 flex items-center pl-8">
          <MdSearch className="text-xl text-gray-600" />
          <input
            type="search"
            placeholder="Buscar por informações no documento"
            className="w-full h-1/2 p-4"
          />
        </header>

        <div className="p-10 h-full">
          <Document />
        </div>
      </main>
    </div>
  );
}

export default HomePage;
