"use client";

import Link from "next/link";

export default function Home() {

  return (
    <div className="flex flex-col min-w-full min-h-svh text-white">
      <main className="flex flex-grow items-center justify-center">
          <table>
            <thead>
              <tr>
                <th>
                  projects:
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Link href="https://luciusscala.com">this website</Link>
                </td>
              </tr>
            </tbody>
          </table>
      </main>
      <footer className="flex items-center justify-center">
          <div className="py-3 text-xs opacity-40">@ 2026 Lucius Scala</div>
      </footer>
    </div>
  );
}
