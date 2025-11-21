import React from 'react'
import { FaGithub } from 'react-icons/fa'

type Props = {}

const Footer = (props: Props) => {
  return (
    <footer
      id="page-footer"
      className="flex flex-none items-center bg-white dark:bg-gray-800"
    >
      <div className="container mx-auto flex flex-col px-4 text-center text-sm md:flex-row md:justify-between md:text-left lg:px-8 xl:max-w-7xl">
        <div className="pt-4 pb-1 md:pb-4">
          <span className="font-medium text-blue-600 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-300">
            Stackmit.
          </span>{" "}
          © {new Date().getFullYear()}
        </div>
        <div className="inline-flex items-center justify-center pt-1 pb-4 md:pt-4">
          <a
            href="https://github.com/fulutas/stackmit-app"
            className="font-medium "
            target="_blank"
          >
            <FaGithub size={20} />
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer