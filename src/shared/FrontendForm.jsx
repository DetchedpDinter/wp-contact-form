import React, { useEffect, useState } from "react";
import FormElements from "../components/FormElements";

const FrontendForm = ({ formId }) => {
  const [fields, setFields] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!formId) return;

    fetch(`/wp-json/cfp/v1/forms/${formId}`)
      .then((res) => res.json())
      .then((data) => {
        setFields(data.fields || []);
        setTitle(data.title || "");
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load form.");
      });
  }, [formId]);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
          <form className="space-y-4">
            <FormElements
              elements={fields}
              isPreviewMode={true}
              selectedElement={null}
              setSelectedElement={() => {}}
              setElements={() => {}}
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
            >
              Submit
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default FrontendForm;
