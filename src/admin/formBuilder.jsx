import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "../index.css";
import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import Droppable from "./Droppable";
import FormElements from "../components/FormElements";
import Sidebar from "../components/Sidebar";
import PropertiesPanel from "../components/PropertiesPanel"; // New Panel Component

const FormBuilder = ({ data }) => {
  const [elements, setElements] = useState([]);
  const [activeElement, setActiveElement] = useState(null);
  const [formName, setFormName] = useState("Untitled Form");
  const [selectedElement, setSelectedElement] = useState(null);
  const [formId, setFormId] = useState(null);

  useEffect(() => {
    if (data) {
      console.log("🔍 Raw Data in FormBuilder:", data);

      setFormId(data.id);
      setFormName(data.title || "Untitled Form");

      try {
        let parsedFields = [];

        if (Array.isArray(data.fields)) {
          parsedFields = data.fields;
        } else if (typeof data.fields === "string") {
          parsedFields = JSON.parse(data.fields);
        } else {
          console.warn("⚠️ Unknown format for fields:", data.fields);
        }

        console.log("✅ Parsed Fields:", parsedFields);
        setElements(parsedFields);
      } catch (error) {
        console.error("❌ Error Parsing Fields:", error, data.fields);
        setElements([]); // fallback to empty array so UI doesn't break
      }
    }
  }, [data]);

  const handleDragStart = (event) => {
    setActiveElement(event.active.id);
  };

  const handleDragEnd = (event) => {
    setActiveElement(null);
    const { over, active } = event;
    if (over && over.id === "drop-area") {
      setElements((prev) => [
        ...prev,
        {
          id: `${active.id}-${Date.now()}`,
          type: active.id,
          label: active.id.charAt(0).toUpperCase() + active.id.slice(1),
          isRequired: false,
          size: "medium",
        },
      ]);
    }
  };

  const saveForm = async () => {
    const dropArea = document.querySelector(".drop-area");
    const formHtml = dropArea ? dropArea.innerHTML : "";

    const formData = {
      title: formName.trim(),
      fields: Array.isArray(elements) ? elements : [],
      html: formHtml, // ✅ Added: Rendered HTML from builder
    };

    try {
      const isUpdating = Boolean(formId);
      const endpoint = isUpdating
        ? `/wp-json/cfp/v1/forms/${formId}`
        : "/wp-json/cfp/v1/forms/";
      const method = isUpdating ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Form saved:", result);
        if (!isUpdating) {
          setFormId(result.id);
        }
        alert("Form saved successfully!");
      } else {
        console.error("Error saving form:", result);
        alert(`Failed to save form: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error saving form:", error);
      alert("An error occurred while saving the form.");
    }
  };

  const submitForm = async () => {
    if (!formId) {
      alert("Cannot submit an unsaved form.");
      return;
    }

    const formData = elements.reduce((acc, field) => {
      acc[field.label] = field.value || "";
      return acc;
    }, {});

    try {
      const response = await fetch("/wp-json/cfp/v1/entries/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_id: formId, data: formData }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Form submitted successfully!");
      } else {
        console.error("Error submitting form:", result);
        alert(`Error: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form.");
    }
  };

  const updateElement = (id, key, value) => {
    setElements((prevElements) =>
      prevElements.map((el) => (el.id === id ? { ...el, [key]: value } : el)),
    );

    if (selectedElement?.id === id) {
      setSelectedElement((prev) => ({ ...prev, [key]: value }));
    }
  };

  return (
    <>
      {typeof window !== "undefined" && (
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 bg-white rounded-xl px-6 py-5 shadow-sm border border-gray-200">
            <div className="flex-1">
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Untitled Form"
                className="w-full text-3xl font-semibold text-gray-900 bg-transparent placeholder-gray-400 focus:outline-none focus:ring-0"
              />
            </div>

            <div className="mt-4 sm:mt-0 sm:ml-4">
              <button
                onClick={saveForm}
                className="bg-black hover:bg-gray-900 text-white text-sm font-medium px-6 py-2.5 rounded-md transition-all shadow-sm"
              >
                {formId ? "Update Form" : "Save Form"}
              </button>
            </div>
          </div>

          <h2 className="text-md font-semibold text-gray-700 mb-3">
            Drag & Drop Your Fields
          </h2>

          <div className="flex h-screen bg-gray-50 p-4">
            <Sidebar />

            <div className="flex-1 flex justify-start pl-6">
              <div className="w-[550px] bg-white p-4 rounded-lg shadow-lg">
                <h2 className="text-md font-semibold text-gray-700 mb-3">
                  🏗️ Build Your Form
                </h2>
                <Droppable id="drop-area">
                  <div className="drop-area bg-gray-100 p-4 pb-20 border-dashed border-2 border-gray-300 min-h-[400px]">
                    <p className="text-gray-500 italic mb-3">
                      Drag and drop fields here
                    </p>
                    <FormElements
                      elements={elements}
                      setElements={setElements}
                      setSelectedElement={setSelectedElement}
                      selectedElement={selectedElement}
                    />
                    <input type="hidden" name="status" value="NEW" />
                    <button
                      onClick={submitForm}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 mt-4"
                    >
                      Submit Form
                    </button>
                  </div>
                </Droppable>
              </div>
            </div>

            <PropertiesPanel
              selectedElement={selectedElement}
              updateElement={updateElement}
            />
          </div>

          <DragOverlay dropAnimation={null}>
            {activeElement && (
              <div className="p-2 bg-white shadow-lg border border-gray-300 rounded-md z-50">
                {activeElement.replace("-", " ").toUpperCase()}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </>
  );
};

export default FormBuilder;

const formBuilderRoot = document.getElementById("cfp-form-builder-app");
if (formBuilderRoot) {
  ReactDOM.render(<FormBuilder />, formBuilderRoot);
}
