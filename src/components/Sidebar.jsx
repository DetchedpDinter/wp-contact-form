import React from "react";
import Draggable from "../admin/Draggable";

const Sidebar = () => {
  return (
    <div className="w-1/4 bg-white shadow-lg rounded-xl p-5 h-screen overflow-y-auto border-r border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-5 text-center">
        📌 Add Fields
      </h2>

      {/* Basic Fields Section */}
      <SidebarSection title="Basic Fields">
        <SidebarItem id="name-input" label="Name" icon="🧍‍♂️" />
        <SidebarItem id="text-input" label="Text" icon="📝" />
        <SidebarItem id="email-input" label="Email" icon="📧" />
        <SidebarItem id="phone-input" label="Phone" icon="📞" />
        <SidebarItem id="textarea" label="Textarea" icon="📜" />
        <SidebarItem id="dropdown" label="Dropdown" icon="🔽" />
        <SidebarItem id="checkbox" label="Checkbox" icon="✅" />
        <SidebarItem id="radio" label="Radio" icon="🔘" />
      </SidebarSection>

      {/* Advanced Fields Section */}
      <SidebarSection title="Advanced Fields">
        <SidebarItem id="number-input" label="Number" icon="🔢" />
        <SidebarItem id="date-input" label="Date" icon="📅" />
        <SidebarItem id="time-input" label="Time" icon="⏳" />
        <SidebarItem id="file-input" label="File Upload" icon="📂" />
        <SidebarItem id="password-input" label="Password" icon="🔒" />
        <SidebarItem id="url-input" label="Website URL" icon="🌐" />
        <SidebarItem id="hidden-input" label="Hidden Field" icon="👻" />
      </SidebarSection>

      {/* Extra Fields Section */}
      <SidebarSection title="Extra Fields">
        <SidebarItem id="range-slider" label="Range Slider" icon="🎚️" />
        <SidebarItem id="color-picker" label="Color Picker" icon="🎨" />
        <SidebarItem id="toggle-switch" label="Toggle Switch" icon="⚡" />
        <SidebarItem id="star-rating" label="Star Rating" icon="⭐" />
        <SidebarItem id="tags-input" label="Tags Input" icon="🏷️" />
        <SidebarItem id="signature-pad" label="Signature Pad" icon="✍️" />
      </SidebarSection>

      {/* Verification Fields Section */}
      <SidebarSection title="Verification Fields">
        <SidebarItem id="math-captcha" label="Math CAPTCHA" icon="🧮" />
        <SidebarItem id="google-recaptcha" label="Google reCAPTCHA" icon="🔒" />
        <SidebarItem id="hcaptcha" label="hCaptcha" icon="🛡️" />
      </SidebarSection>
    </div>
  );
};

// Sidebar Section Component
const SidebarSection = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>
    <div className="grid grid-cols-2 gap-3">{children}</div>
  </div>
);

// Sidebar Item Component (Draggable Wrapper)
const SidebarItem = ({ id, label, icon }) => (
  <Draggable id={id} label={label}>
    <div className="flex items-center justify-center w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg cursor-pointer transition-all duration-200 text-sm px-2">
      <span className="mr-2">{icon}</span>
      {label}
    </div>
  </Draggable>
);

export default Sidebar;
