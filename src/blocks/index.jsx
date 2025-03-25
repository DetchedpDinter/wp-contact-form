const { registerBlockType } = wp.blocks;
const { useSelect } = wp.data;
const { SelectControl } = wp.components;
const { decodeEntities } = wp.htmlEntities;
const { useEffect, useState } = wp.element;
const apiFetch = wp.apiFetch;
import "../index.css";

registerBlockType("cfp/form-selector", {
  title: "Form Selector",
  category: "common",
  attributes: {
    selectedForm: {
      type: "string",
      default: "",
    },
  },
  edit: ({ attributes, setAttributes }) => {
    const forms = useSelect((select) => {
      return select("core").getEntityRecords("postType", "cfp_form", {
        per_page: -1,
      });
    }, []);

    return (
      <div>
        <SelectControl
          label="Select a Form"
          value={attributes.selectedForm}
          options={
            forms
              ? [
                  { label: "Select a Form", value: "" },
                  ...forms.map((form) => ({
                    label: decodeEntities(form.title.rendered),
                    value: form.id,
                  })),
                ]
              : [{ label: "Loading...", value: "" }]
          }
          onChange={(value) => setAttributes({ selectedForm: value })}
          __nextHasNoMarginBottom={true}
        />
      </div>
    );
  },
  save: ({ attributes }) => {
    return (
      <div data-form-id={attributes.selectedForm}>
        console.log("Form ID:", attributes.selectedForm);
      </div>
    );
  },
});
