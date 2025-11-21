import ReactDOM from 'react-dom/client'
import { Navigate, RouterProvider, createHashRouter } from 'react-router-dom';
import { WindowContextProvider, menuItems } from '@/lib/window'
import { Toaster } from 'sonner';

import appIcon from '@/resources/build/icon.png'
import '@/lib/window/window.css'
import './styles/app.css'

import Layout from './components/page-shared/Layout';
import ProjectGitControl from './pages/project-git-control/ProjectGitControl';
import Profile from './pages/Profile';

const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', handle: { pageTitle: 'Anasayfa' }, element: <Navigate to="/project-git-control" replace /> },
      { path: '/project-git-control', handle: { pageTitle: 'Project Git Control' }, element: <ProjectGitControl /> },
      { path: '/profile', handle: { pageTitle: 'Profile' }, element: <Profile /> },
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <WindowContextProvider titlebar={{ title: 'Stackmit', icon: appIcon, menuItems }}>
    <Toaster richColors position="top-center" />
    <RouterProvider router={router} />
  </WindowContextProvider>
)
