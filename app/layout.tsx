  import "./globals.css";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { SiGmail } from "react-icons/si";


  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="en">
        <body>
          {children}
            <footer className="w-full py-6 text-center text-sm flex flex-col items-center gap-1 bg-background">
              <div className="flex flex-row gap-3 justify-center mt-1">
                <a href="mailto:luciusscala@gmail.com" target="_blank" rel="noopener noreferrer">
                  <SiGmail className="w-7 h-7 text-gray-700 dark:text-gray-100 hover:text-red-500 transition" title="Gmail" />
                </a>
                <a href="https://github.com/luciusscala/" target="_blank" rel="noopener noreferrer">
                  <FaGithub className="w-6 h-6 text-gray-700 dark:text-gray-100 hover:text-gray-800 transition" title="GitHub" />
                </a>
                <a href="https://linkedin.com/in/lucius-scala-41aba72b6/" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin className="w-6 h-6 text-gray-700 dark:text-gray-100 hover:text-blue-600 transition" title="LinkedIn" />
                </a>
              </div>
              <div className="mt-2 text-xs opacity-70">@ {new Date().getFullYear()} Lucius Scala</div>
            </footer>
          </body>
        </html>
      );
    }

