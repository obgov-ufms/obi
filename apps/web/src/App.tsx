import "@vega/documents/dist/style.css";
import { DocumentProvider } from "@vega/documents";
import HomePage from "./pages";
import { addNode, deleteNode, updateNode } from "@/state/DocumentNodeStore";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import DocumentPage from "./pages/document";

const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage,
  },
  {
    path: "/document/:documentId",
    Component: DocumentPage,
  },
]);

export function App() {
  return (
    <DocumentProvider
      addNode={addNode}
      updateNode={updateNode}
      deleteNode={deleteNode}
    >
      <RouterProvider router={router} />
    </DocumentProvider>
  );
}

export default App;
