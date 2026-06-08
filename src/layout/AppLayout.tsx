import Sidebar from './Sidebar/Sidebar'
import Topbar from './Topbar/Topbar'
import ContentArea from './ContentArea/ContentArea'

export default function AppLayout() {
  return (
    <>
      <a href="#content" className="skip-link">Skip to main content</a>
      <div className="app">
        <Sidebar />
        <div className="main">
          <Topbar />
          <ContentArea />
        </div>
      </div>
    </>
  )
}