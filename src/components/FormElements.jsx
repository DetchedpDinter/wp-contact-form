import React, { useState, useRef } from "react";
import SignaturePad from "react-signature-canvas";
import { FaTrash, FaStar, FaRegStar, FaTimes } from "react-icons/fa";

const FormElements = ({
  elements,
  setElements,
  setSelectedElement,
  selectedElement,
}) => {
  const [errors, setErrors] = useState({});
  const [toggleStates, setToggleStates] = useState({});
  const [tagInputs, setTagInputs] = useState({});
  const signaturePads = useRef({});
  const [ratings, setRatings] = useState({});
  const [fileInputs, setFileInputs] = useState({});

  const handleFileChange = (e, el) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Selected file for", el.label, ":", file);
      setFileInputs((prev) => ({
        ...prev,
        [el.id]: file.name, // Or save the full file if needed
      }));
    }
  };

  const validateField = (id, value, isRequired) => {
    setErrors((prev) => ({
      ...prev,
      [id]: isRequired && !value.trim() ? "This field is required" : "",
    }));
  };

  const handleDelete = (id) => {
    setElements((prev) => prev.filter((el) => el.id !== id));
  };

  const getSizeClass = (size) => {
    switch (size) {
      case "small":
        return "w-1/2 text-base p-2";
      case "medium":
        return "w-3/4 text-lg p-3";
      case "large":
      default:
        return "w-full text-xl p-4";
    }
  };

  const handleTagKeyDown = (e, id) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      const tag = e.target.value.trim();
      setTagInputs((prev) => ({
        ...prev,
        [id]: [...(prev[id] || []), tag],
      }));
      e.target.value = "";
    }
  };

  const removeTag = (id, tag) => {
    setTagInputs((prev) => ({
      ...prev,
      [id]: prev[id].filter((t) => t !== tag),
    }));
  };

  const handleRatingChange = (id, value) => {
    setRatings((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <div>
      {elements?.map((el) => {
        const isSelected = selectedElement?.id === el.id;
        const isSimpleInput = !["checkbox", "radio"].includes(el.type);
        const commonClasses = `border rounded-md block ${
          isSimpleInput ? getSizeClass(el.size) : ""
        } mt-2`;

        return (
          <div
            key={el.id}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedElement(el);
            }}
            className={`relative p-3 border rounded-md mb-3 cursor-pointer shadow-sm transition-all ${
              isSelected ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
          >
            {/* Label & Delete */}
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700">
                {el.label || "Unnamed Field"}{" "}
                {el.isRequired && <span className="text-red-500">*</span>}
              </label>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(el.id);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTrash size={12} />
              </button>
            </div>

            {/* Input Fields */}
            {(() => {
              switch (el.type) {
                case "name-input":
                  return (
                    <div className="flex gap-3 mt-2">
                      <input
                        type="text"
                        className={`${getSizeClass("small")} border rounded-md`}
                        placeholder="First Name"
                        required={el.isRequired}
                      />
                      <input
                        type="text"
                        className={`${getSizeClass("small")} border rounded-md`}
                        placeholder="Last Name"
                        required={el.isRequired}
                      />
                    </div>
                  );
                case "text-input":
                  return (
                    <input
                      type="text"
                      className={commonClasses}
                      placeholder="Enter text"
                      required={el.isRequired}
                      onBlur={(e) =>
                        validateField(el.id, e.target.value, el.isRequired)
                      }
                    />
                  );
                case "email-input":
                  return (
                    <input
                      type="email"
                      className={commonClasses}
                      placeholder="Enter email"
                      required={el.isRequired}
                    />
                  );
                case "phone-input":
                  return (
                    <input
                      type="tel"
                      className={commonClasses}
                      placeholder="Enter phone number"
                    />
                  );
                case "textarea":
                  return (
                    <textarea
                      className={commonClasses}
                      placeholder="Enter text"
                    />
                  );
                case "dropdown":
                  return (
                    <select className={commonClasses}>
                      <option value="">Select an option</option>
                      {el.options?.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  );
                case "checkbox":
                  return (
                    <div className="flex flex-col gap-2 mt-2">
                      {el.options?.map((option, index) => (
                        <label
                          key={index}
                          className="flex items-center text-sm"
                        >
                          <input type="checkbox" className="mr-2" />
                          {option}
                        </label>
                      ))}
                    </div>
                  );
                case "radio":
                  return (
                    <div className="flex flex-col gap-2 mt-2">
                      {el.options?.map((option, index) => (
                        <label
                          key={index}
                          className="flex items-center text-sm"
                        >
                          <input
                            type="radio"
                            name={`radio-${el.id}`}
                            className="mr-2"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  );
                case "number-input":
                  return <input type="number" className={commonClasses} />;
                case "date-input":
                  return <input type="date" className={commonClasses} />;
                case "time-input":
                  return <input type="time" className={commonClasses} />;
                case "password-input":
                  return <input type="password" className={commonClasses} />;
                case "url-input":
                  return <input type="url" className={commonClasses} />;
                case "range-slider":
                  return (
                    <input
                      type="range"
                      className="w-full mt-2"
                      min="0"
                      max="100"
                      step="1"
                    />
                  );
                case "color-picker":
                  return (
                    <input
                      type="color"
                      className="w-16 h-10 mt-2 border rounded-md"
                    />
                  );
                case "toggle-switch":
                  return (
                    <div
                      className="flex items-center mt-2 cursor-pointer"
                      onClick={() =>
                        setToggleStates((prev) => ({
                          ...prev,
                          [el.id]: !prev[el.id],
                        }))
                      }
                    >
                      <div
                        className={`w-10 h-5 rounded-full transition-all ${
                          toggleStates[el.id] ? "bg-green-500" : "bg-gray-300"
                        } relative`}
                      >
                        <div
                          className={`absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow transition-all ${
                            toggleStates[el.id] ? "translate-x-5" : ""
                          }`}
                        ></div>
                      </div>
                    </div>
                  );
                case "file-input":
                  return (
                    <div className="mt-2">
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, el)}
                        className="mt-1 block w-full text-sm text-gray-700
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   hover:file:bg-blue-100"
                      />
                    </div>
                  );
                case "tags-input":
                  return (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(tagInputs[el.id] || []).map((tag) => (
                          <span
                            key={tag}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center"
                          >
                            {tag}
                            <FaTimes
                              onClick={() => removeTag(el.id, tag)}
                              className="ml-1 cursor-pointer"
                            />
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        className={commonClasses}
                        placeholder="Add a tag and press Enter"
                        onKeyDown={(e) => handleTagKeyDown(e, el.id)}
                      />
                    </div>
                  );
                case "star-rating":
                  return (
                    <div className="flex mt-2 space-x-1 text-yellow-500">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const filled = ratings[el.id] >= star;
                        return (
                          <span
                            key={star}
                            onClick={() => handleRatingChange(el.id, star)}
                            className="cursor-pointer"
                          >
                            {filled ? <FaStar /> : <FaRegStar />}
                          </span>
                        );
                      })}
                    </div>
                  );
                case "signature-pad":
                  return (
                    <div className="mt-2 border rounded-md overflow-hidden">
                      <SignaturePad
                        ref={(ref) => (signaturePads.current[el.id] = ref)}
                        canvasProps={{
                          width: 300,
                          height: 150,
                          className: "bg-white border",
                        }}
                      />
                    </div>
                  );
                case "hidden-input":
                  return (
                    <>
                      <input type="hidden" value={el.defaultValue || ""} />
                      <p className="text-xs text-gray-400 italic mt-1">
                        This is a hidden field.
                      </p>
                    </>
                  );
                case "html-block":
                  return (
                    <div
                      className="prose text-sm mt-2"
                      dangerouslySetInnerHTML={{
                        __html: el.html || "<em>[Custom HTML block]</em>",
                      }}
                    />
                  );
                case "math-captcha":
                  return (
                    <p className="text-sm text-gray-600 mt-2">
                      [Math CAPTCHA will be rendered here]
                    </p>
                  );
                case "google-recaptcha":
                  return (
                    <p className="text-sm text-gray-600 mt-2">
                      [Google reCAPTCHA placeholder]
                    </p>
                  );
                case "hcaptcha":
                  return (
                    <p className="text-sm text-gray-600 mt-2">
                      [hCaptcha placeholder]
                    </p>
                  );
                default:
                  return null;
              }
            })()}

            {/* Description */}
            {el.description && (
              <p className="text-xs text-gray-500 mt-1">{el.description}</p>
            )}

            {/* Error Message */}
            {errors[el.id] && (
              <p className="text-xs text-red-500 mt-1">{errors[el.id]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default FormElements;
