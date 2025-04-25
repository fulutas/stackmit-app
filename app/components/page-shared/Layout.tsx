import { Outlet } from 'react-router-dom';

import Header from './Header'
import Footer from './Footer';

const Layout = () => {

  return (
    <>
      <div id="page-container" className="mx-auto flex min-h-dvh w-full min-w-80 flex-col bg-gray-100 dark:bg-gray-900 dark:text-gray-100">
        <Header />
        <main id="page-content" className="flex max-w-full flex-auto flex-col">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  )
}

export default Layout