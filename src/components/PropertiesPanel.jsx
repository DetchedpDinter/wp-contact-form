import React from "react";

const PropertiesPanel = ({ selectedElement, updateElement }) => {
  if (!selectedElement)
    return (
      <div className="p-4 w-72 flex items-center justify-center h-full">
        <div className="relative w-full h-full border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 shadow-sm">
          <svg
            className="absolute w-full h-full text-gray-300 opacity-50"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <line
              x1="0"
              y1="0"
              x2="100"
              y2="100"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="100"
              y1="0"
              x2="0"
              y2="100"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span className="text-gray-500 font-medium text-base text-center">
            No element selected
          </span>
        </div>
      </div>
    );

  const updateOptions = (newOptions) => {
    updateElement(selectedElement.id, "options", newOptions);
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-md w-72 border border-gray-200">
      <h3 className="text-md font-semibold mb-3">Field Properties</h3>

      {/* Label */}
      <label className="block text-sm font-medium mb-1">Label</label>
      <input
        type="text"
        value={selectedElement.label}
        onChange={(e) =>
          updateElement(selectedElement.id, "label", e.target.value)
        }
        className="border rounded-md w-full p-2 mb-3 focus:ring-2 focus:ring-blue-400"
      />

      {/* Description */}
      <label className="block text-sm font-medium mb-1">Description</label>
      <textarea
        value={selectedElement.description || ""}
        onChange={(e) =>
          updateElement(selectedElement.id, "description", e.target.value)
        }
        className="border rounded-md w-full p-2 mb-3 focus:ring-2 focus:ring-blue-400"
        placeholder="Add a description..."
      />

      {/* Field Size */}
      {!["checkbox", "radio", "name-input"].includes(selectedElement.type) && (
        <>
          <label className="block text-sm font-medium mb-1">Field Size</label>
          <div className="flex gap-2 mb-3">
            {["small", "medium", "large"].map((size) => (
              <button
                key={size}
                onClick={() => updateElement(selectedElement.id, "size", size)}
                className={`px-3 py-1 text-sm rounded-md border transition ${
                  selectedElement.size === size
                    ? "bg-blue-500 text-white border-blue-500 shadow-md"
                    : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                }`}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Required Checkbox */}
      <label className="flex items-center text-sm font-medium mb-3">
        <input
          type="checkbox"
          checked={selectedElement.isRequired || false}
          onChange={(e) =>
            updateElement(selectedElement.id, "isRequired", e.target.checked)
          }
          className="mr-2 w-4 h-4"
        />
        Make this field required
      </label>

      {/* Options for Dropdown, Checkbox, Radio */}
      {["dropdown", "checkbox", "radio"].includes(selectedElement.type) && (
        <div>
          <label className="block text-sm font-medium mb-1">
            {selectedElement.type === "dropdown"
              ? "Dropdown Options"
              : selectedElement.type === "checkbox"
              ? "Checkbox Options"
              : "Radio Options"}
          </label>
          {selectedElement.options?.map((option, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...selectedElement.options];
                  newOptions[index] = e.target.value;
                  updateOptions(newOptions);
                }}
                className="border rounded-md w-full p-2"
              />
              <button
                onClick={() => {
                  const newOptions = selectedElement.options.filter(
                    (_, i) => i !== index
                  );
                  updateOptions(newOptions);
                }}
                className="ml-2 text-red-500 text-sm"
              >
                ❌
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              updateOptions([...(selectedElement.options || []), ""])
            }
            className="w-full mt-2 bg-blue-500 text-white p-2 rounded-md text-sm"
          >
            ➕ Add Option
          </button>
        </div>
      )}
    </div>
  );
};

export default PropertiesPanel;
