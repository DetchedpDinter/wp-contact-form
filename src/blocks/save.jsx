import { useBlockProps } from "@wordpress/block-editor";

export default function Save() {
  return (
    <div {...useBlockProps({ className: "p-4 bg-blue-100" })}>
      <p>Hello from the frontend! 🎉</p>
    </div>
  );
}
