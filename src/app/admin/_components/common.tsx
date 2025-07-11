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
          ? "bg-white/10 text-white "
          : "bg-foreground/40 text-white hover:bg-foreground/20"
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
    <div className="flex flex-col text-white">
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
      <div className="p-4 bg-white/10 rounded-lg shadow-lg rounded-tl-none text-white">
        {tabs[activeTab].content}
      </div>
    </div>
  );
};

export default Common;