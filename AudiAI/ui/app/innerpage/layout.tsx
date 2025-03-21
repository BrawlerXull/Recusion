import Sidebar from "@/components/side-bar";
import React from "react";


interface InnerPageLayoutProps {
  children: React.ReactNode;
}

const InnerPageLayout: React.FC<InnerPageLayoutProps> = ({ children }) => {
  return <Sidebar>{children}</Sidebar>;
};

export default InnerPageLayout;
