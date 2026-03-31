import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './page/Home'
import View from './page/View'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/v/:id" element={<View />} />
      </Routes>
    </BrowserRouter>
  )
}