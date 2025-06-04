"use client";

import { PropsWithChildren, useState } from "react";

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Tab = ({ label, isActive, onClick }: TabProps) => {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
        isActive
          ? "bg-foreground text-white "
          : "bg-foreground/60 text-white hover:bg-foreground/80"
      }`}
    >
      {label}
    </button>
  );
};

interface CommonProps extends PropsWithChildren {
  tabs?: {
    label: string;
    content: React.ReactNode;
  }[];
}

const Common = ({ children, tabs }: CommonProps) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!tabs) {
    return (
      <div className="p-4 rounded-lg shadow">
        {children}
      </div>
    );
  }

  return (
    <div className="flex flex-col ">
      <div className="flex ">
        {tabs.map((tab, index) => (
          <Tab
            key={tab.label}
            label={tab.label}
            isActive={activeTab === index}
            onClick={() => setActiveTab(index)}
          />
        ))}
      </div>
      <div className="p-4 bg-foreground rounded-lg shadow-lg rounded-tl-none">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Common;