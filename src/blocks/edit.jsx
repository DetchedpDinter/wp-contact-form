import { useBlockProps } from "@wordpress/block-editor";

export default function Edit() {
  return (
    <div {...useBlockProps({ className: "p-4 bg-blue-100" })}>
      <p>Hello from the editor! 🎉</p>
    </div>
  );
}
