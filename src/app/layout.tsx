"use client";

import Sidebar from "@/app/PatientDashboard/layout/sidebar/Sidebar";
import Header from "@/app/PatientDashboard/layout/header/Header";
import React, { useState, ReactNode } from "react";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";

interface RootLayoutProps {
  children?: ReactNode;
}

const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/error", "/auth/reset", "/auth/new-password", "/auth/new-verification"];

export default function RootLayout({ children }: RootLayoutProps) {
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isAuthPage = AUTH_ROUTES.some((route) => pathname?.startsWith(route));

  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <SessionProvider>
          {isAuthPage ? (
            <main className="flex min-h-screen items-center justify-center">
              {children}
            </main>
          ) : (
            <div className="flex min-h-screen">
              <Sidebar
                isSidebarOpen={true}
                isMobileSidebarOpen={isMobileSidebarOpen}
                onSidebarClose={() => setMobileSidebarOpen(false)}
              />
              <div className="flex flex-col flex-1">
                <Header toggleMobileSidebar={() => setMobileSidebarOpen(true)} />
                <main className="flex-1 flex justify-center items-center p-8">
                  <div className="w-full min-w-4xl p-6 rounded-lg shadow-md">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}
