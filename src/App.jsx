import react from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee } from '@fortawesome/free-solid-svg-icons';



function App() {

  return (
    <>
<h1 className="text-3xl font-bold text-center text-red-700 mt-5">
  Hello
</h1>

        <FontAwesomeIcon icon={faCoffee} size="2x" />
    </>
  )
}

export default App
