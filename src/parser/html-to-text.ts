import { convert } from "html-to-text";

const HEADING_OPTIONS = { leadingLineBreaks: 1, trailingLineBreaks: 1, uppercase: false };

export function convertHtmlToText(inputHtml: string) {
  const text = convert(inputHtml, {
    wordwrap: false,
    preserveNewlines: false,
    selectors: [
      { selector: "p", options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
      { selector: "h1", options: HEADING_OPTIONS },
      { selector: "h2", options: HEADING_OPTIONS },
      { selector: "h3", options: HEADING_OPTIONS },
      { selector: "h4", options: HEADING_OPTIONS },
      { selector: "h5", options: HEADING_OPTIONS },
      { selector: "h6", options: HEADING_OPTIONS },
      { selector: "h5", options: HEADING_OPTIONS },
      { selector: "h6", options: HEADING_OPTIONS },
      {
        selector: "td",
        format: "tdWithSpace",
      },
      {
        selector: "tr",
        format: "block",
        options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
      },
    ],
    formatters: {
      tdWithSpace(elem, walk, builder) {
        builder.addInline(" ");
        walk(elem.children, builder);
        builder.addInline(" ");
      },
    },
    // { selector: "table", options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
  });

  // const output = cleanEmptyLines(text);
  // console.log(output);
  return text;
}

export function cleanEmptyLines(text: string) {
  // return text
  //   .split(/\n\n/)
  //   .filter(Boolean)
  //   .map((e) => e.trim())
  //   .join("\n");

  return text
    .split(/\r|\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
}
