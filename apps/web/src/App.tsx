import '@vega/documents/dist/style.css'
import { DocumentProvider } from '@vega/documents'
import HomePage from './pages'
import { addNode, deleteNode, updateNode } from '@/state/DocumentNodeStore'

export function App() {
  return (
      <DocumentProvider 
        addNode={addNode} 
        updateNode={updateNode} 
        deleteNode={deleteNode}
      >
      <HomePage />
      </DocumentProvider>
  )
}

export default App
