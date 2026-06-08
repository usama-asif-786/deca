import { Outlet } from 'react-router-dom'

export default function ContentArea() {
  return (
    <div className="content" id="content">
      <div className="animate-in">
        <Outlet />
      </div>
    </div>
  )
}