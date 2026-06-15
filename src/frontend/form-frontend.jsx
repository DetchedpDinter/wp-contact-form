const { createElement, useState, useEffect } = window.wp.element;
const apiFetch = window.wp.apiFetch;

import "../index.css";

const createRoot =
  window.wp.element.createRoot ||
  ((el) => ({
    render: (component) => window.wp.element.render(component, el),
  }));

function FrontendForm({ formId }) {
  const [formTitle, setFormTitle] = useState("");
  const [fields, setFields] = useState([]);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!formId) return;

    apiFetch({ path: `/cfp/v1/forms/${formId}` })
      .then((data) => {
        setFormTitle(data.title || "");

        if (Array.isArray(data.fields)) {
          // IMPORTANT:
          // Ensure every field has permanent id
          const normalizedFields = data.fields.map((field, index) => ({
            ...field,
            id:
              field.id ||
              `field_${Date.now()}_${index}_${Math.random()
                .toString(36)
                .substring(2, 8)}`,
          }));

          setFields(normalizedFields);
        } else {
          throw new Error("Form fields are not an array.");
        }
      })
      .catch((err) => {
        console.error("Error loading form fields:", err);
        setError("Failed to load form fields.");
      });
  }, [formId]);

  const getSizeClass = (size) => {
    switch (size) {
      case "small":
        return "w-1/2";

      case "medium":
        return "w-3/4";

      case "large":
      default:
        return "w-full";
    }
  };

  const handleInputChange = (id, value) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccessMessage("");
    setError(null);

    /*
      NEW STRUCTURE

      {
        field_xxx: {
          type,
          label,
          value
        }
      }
    */

    const dataToSubmit = fields.reduce((acc, field, index) => {
      const fieldId = field.id;
      const label = field.label || `Field ${index + 1}`;

      let value = "";

      switch (field.type) {
        case "name-input":
          const first = formData[`${fieldId}-first`] || "";
          const last = formData[`${fieldId}-last`] || "";

          value = `${first} ${last}`.trim();
          break;

        case "checkbox":
          value = formData[fieldId] || [];
          break;

        case "toggle-switch":
          value = formData[fieldId] || false;
          break;

        case "file-upload":
          value = formData[fieldId] || null;
          break;

        default:
          value = formData[fieldId] || "";
      }

      acc[fieldId] = {
        type: field.type,
        label,
        value,
      };

      return acc;
    }, {});

    console.log("Structured Submission Data:", dataToSubmit);

    try {
      const response = await fetch("/wp-json/cfp/v1/entries/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          form_id: formId,
          data: dataToSubmit,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccessMessage("Form submitted successfully!");
        setFormData({});
      } else {
        setError(result.message || "Unknown error occurred.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setError("An error occurred while submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field, index) => {
    const id = field.id;
    const label = field.label || `Field ${index + 1}`;
    const sizeClass = getSizeClass(field.size);
    const isRequired = field.isRequired || field.required;

    const wrapperClass = `mb-6 ${sizeClass}`;

    const labelElement = createElement(
      "label",
      {
        htmlFor: id,
        className: "block text-sm font-medium text-gray-700 mb-1",
      },
      label,
      isRequired
        ? createElement(
            "span",
            {
              className: "text-red-500",
            },
            " *",
          )
        : null,
    );

    const commonProps = {
      id,
      name: id,
      required: isRequired,
      className:
        "mt-1 block w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm",
    };

    switch (field.type) {
      case "heading":
        return createElement(
          "h3",
          {
            key: index,
            className: "text-xl font-semibold mb-4",
          },
          field.content || label,
        );

      case "paragraph":
        return createElement(
          "p",
          {
            key: index,
            className: "text-gray-700 mb-4",
          },
          field.content || label,
        );

      case "html":
        return createElement("div", {
          key: index,
          className: "mb-4 prose",
          dangerouslySetInnerHTML: {
            __html: field.content || "",
          },
        });

      case "phone-input":
        return createElement(
          "div",
          {
            key: index,
            className: wrapperClass,
          },
          labelElement,
          createElement("input", {
            ...commonProps,
            type: "tel",
            placeholder: field.placeholder || "Enter phone number",
            value: formData[id] || "",
            onChange: (e) => handleInputChange(id, e.target.value),
          }),
        );

      case "number-input":
        return createElement(
          "div",
          {
            key: index,
            className: wrapperClass,
          },
          labelElement,
          createElement("input", {
            ...commonProps,
            type: "number",
            placeholder: field.placeholder || "Enter number",
            value: formData[id] || "",
            onChange: (e) => handleInputChange(id, e.target.value),
          }),
        );

      case "time-input":
        return createElement(
          "div",
          {
            key: index,
            className: wrapperClass,
          },
          labelElement,
          createElement("input", {
            ...commonProps,
            type: "time",
            value: formData[id] || "",
            onChange: (e) => handleInputChange(id, e.target.value),
          }),
        );

      case "password-input":
        return createElement(
          "div",
          {
            key: index,
            className: wrapperClass,
          },
          labelElement,
          createElement("input", {
            ...commonProps,
            type: "password",
            placeholder: field.placeholder || "Enter password",
            value: formData[id] || "",
            onChange: (e) => handleInputChange(id, e.target.value),
          }),
        );

      case "url-input":
        return createElement(
          "div",
          {
            key: index,
            className: wrapperClass,
          },
          labelElement,
          createElement("input", {
            ...commonProps,
            type: "url",
            placeholder: field.placeholder || "https://example.com",
            value: formData[id] || "",
            onChange: (e) => handleInputChange(id, e.target.value),
          }),
        );

      case "hidden-input":
        return createElement("input", {
          key: index,
          type: "hidden",
          id,
          name: id,
          value: field.value || "",
        });

      case "range-slider":
        return createElement(
          "div",
          {
            key: index,
            className: wrapperClass,
          },
          labelElement,
          createElement("input", {
            ...commonProps,
            type: "range",
            min: field.min || 0,
            max: field.max || 100,
            value: formData[id] || 50,
            onChange: (e) => handleInputChange(id, e.target.value),
          }),
          createElement(
            "p",
            {
              className: "text-sm text-gray-500 mt-1",
            },
            formData[id] || 50,
          ),
        );

      case "color-picker":
        return createElement(
          "div",
          {
            key: index,
            className: wrapperClass,
          },
          labelElement,
          createElement("input", {
            ...commonProps,
            type: "color",
            value: formData[id] || "#000000",
            onChange: (e) => handleInputChange(id, e.target.value),
          }),
        );

      case "toggle-switch":
        return createElement(
          "div",
          {
            key: index,
            className: wrapperClass,
          },
          createElement(
            "label",
            {
              className: "inline-flex items-center cursor-pointer",
            },
            createElement("input", {
              type: "checkbox",
              className: "sr-only peer",
              checked: formData[id] || false,
              onChange: (e) => handleInputChange(id, e.target.checked),
            }),
            createElement("div", {
              className:
                "w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 relative after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full",
            }),
            createElement(
              "span",
              {
                className: "ml-3 text-sm text-gray-700",
              },
              label,
            ),
          ),
        );

      case "file-upload":
        return createElement(
          "div",
          {
            key: index,
            className: wrapperClass,
          },
          labelElement,
          createElement("input", {
            ...commonProps,
            type: "file",
            onChange: (e) => {
              const file = e.target.files[0];

              handleInputChange(id, file ? file.name : "");
            },
          }),
        );

      case "date-picker":
        return createElement(
          "div",
          {
            key: index,
            className: wrapperClass,
          },
          labelElement,
          createElement("input", {
            ...commonProps,
            type: "date",
            value: formData[id] || "",
            onChange: (e) => handleInputChange(id, e.target.value),
          }),
        );

      case "captcha":
        return createElement(
          "div",
          {
            key: index,
            className: wrapperClass,
          },
          createElement(
            "label",
            {
              className: "text-sm text-gray-700 mb-2 block",
            },
            "What is 3 + 4?",
          ),
          createElement("input", {
            ...commonProps,
            type: "text",
            placeholder: "Your answer",
            value: formData[id] || "",
            onChange: (e) => handleInputChange(id, e.target.value),
          }),
        );

      case "name-input":
        return createElement(
          "div",
          {
            key: index,
            className: wrapperClass,
          },
          labelElement,
          createElement(
            "div",
            {
              className: "flex gap-4",
            },
            createElement("input", {
              ...commonProps,
              id: `${id}-first`,
              name: `${id}-first`,
              placeholder: "First name",
              value: formData[`${id}-first`] || "",
              onChange: (e) => handleInputChange(`${id}-first`, e.target.value),
            }),
            createElement("input", {
              ...commonProps,
              id: `${id}-last`,
              name: `${id}-last`,
              placeholder: "Last name",
              value: formData[`${id}-last`] || "",
              onChange: (e) => handleInputChange(`${id}-last`, e.target.value),
            }),
          ),
        );

      case "text-input":
      case "email-input":
        return createElement(
          "div",
          {
            key: index,
            className: wrapperClass,
          },
          labelElement,
          createElement("input", {
            ...commonProps,
            type: field.type === "email-input" ? "email" : "text",
            placeholder: field.placeholder || "Enter value",
            value: formData[id] || "",
            onChange: (e) => handleInputChange(id, e.target.value),
          }),
        );

      case "textarea":
        return createElement(
          "div",
          {
            key: index,
            className: wrapperClass,
          },
          labelElement,
          createElement("textarea", {
            ...commonProps,
            rows: 4,
            placeholder: field.placeholder || "Type here...",
            value: formData[id] || "",
            onChange: (e) => handleInputChange(id, e.target.value),
          }),
        );

      case "dropdown":
        return createElement(
          "div",
          {
            key: index,
            className: wrapperClass,
          },
          labelElement,
          createElement(
            "select",
            {
              ...commonProps,
              value: formData[id] || "",
              onChange: (e) => handleInputChange(id, e.target.value),
            },
            createElement(
              "option",
              {
                value: "",
              },
              "-- Select --",
            ),
            (field.options || []).map((opt, i) =>
              createElement(
                "option",
                {
                  key: i,
                  value: opt,
                },
                opt,
              ),
            ),
          ),
        );

      case "checkbox":
        return createElement(
          "div",
          {
            key: index,
            className: wrapperClass,
          },
          labelElement,
          createElement(
            "div",
            {
              className: "flex flex-col gap-2",
            },
            (field.options || []).map((opt, i) =>
              createElement(
                "label",
                {
                  key: i,
                  className: "inline-flex items-center",
                },
                createElement("input", {
                  type: "checkbox",
                  name: id,
                  value: opt,
                  checked: (formData[id] || []).includes(opt),
                  onChange: (e) => {
                    const checked = e.target.checked;

                    setFormData((prev) => {
                      const prevArray = prev[id] || [];

                      return {
                        ...prev,
                        [id]: checked
                          ? [...prevArray, opt]
                          : prevArray.filter((v) => v !== opt),
                      };
                    });
                  },
                  className: "mr-2",
                }),
                opt,
              ),
            ),
          ),
        );

      case "radio":
        return createElement(
          "div",
          {
            key: index,
            className: wrapperClass,
          },
          labelElement,
          createElement(
            "div",
            {
              className: "flex flex-col gap-2",
            },
            (field.options || []).map((opt, i) =>
              createElement(
                "label",
                {
                  key: i,
                  className: "inline-flex items-center",
                },
                createElement("input", {
                  type: "radio",
                  name: id,
                  value: opt,
                  checked: formData[id] === opt,
                  onChange: (e) => handleInputChange(id, e.target.value),
                  className: "mr-2",
                }),
                opt,
              ),
            ),
          ),
        );

      default:
        return null;
    }
  };

  return createElement(
    "form",
    {
      onSubmit: handleSubmit,
      className: "max-w-4xl mx-auto p-6 bg-white rounded-md shadow-md",
    },

    formTitle &&
      createElement(
        "h2",
        {
          className: "text-2xl font-bold mb-6 text-gray-800",
        },
        formTitle,
      ),

    error &&
      createElement(
        "p",
        {
          className: "text-red-600 mb-4",
        },
        error,
      ),

    successMessage &&
      createElement(
        "p",
        {
          className: "text-green-600 mb-4",
        },
        successMessage,
      ),

    fields.map(renderField),

    createElement(
      "button",
      {
        type: "submit",
        disabled: loading,
        className: `bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`,
      },
      loading ? "Submitting..." : "Submit",
    ),
  );
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-form-id]").forEach((el) => {
    const formId = el.getAttribute("data-form-id");

    if (!el.hasAttribute("data-react-mounted")) {
      const root = createRoot(el);

      root.render(
        createElement(FrontendForm, {
          formId,
        }),
      );

      el.setAttribute("data-react-mounted", "true");
    }
  });
});
