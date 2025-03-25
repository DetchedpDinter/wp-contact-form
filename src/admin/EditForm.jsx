import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import FormBuilder from "./formBuilder"; // Your existing form builder component

const EditFormBuilder = () => {
  const [formData, setFormData] = useState(null);
  const formId = new URLSearchParams(window.location.search).get("form_id");

  useEffect(() => {
    if (!formId) return; // No form ID, nothing to fetch

    fetch(`/wp-json/cfp/v1/forms/${formId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Form Data:", data);
        setFormData(data);
      })
      .catch((error) => console.error("Error fetching form data:", error));
  }, [formId]);

  if (!formData) {
    return <p>Loading form...</p>;
  }

  return (
    <div>
      <h2>Editing Form: {formData.title}</h2>
      <FormBuilder data={formData} />
    </div>
  );
};

export default EditFormBuilder;

// Render inside existing WordPress admin div
const editFormBuilderRoot = document.getElementById("cfp-edit-form-root");
if (editFormBuilderRoot) {
  ReactDOM.render(<EditFormBuilder />, editFormBuilderRoot);
}
