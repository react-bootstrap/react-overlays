/**
 * Get the height of the document
 *
 * @returns {documentHeight: number}
 */
export default function (doc) {
  return Math.max(
    doc.documentElement.offsetHeight || 0,
    doc.height || 0,
    doc.body.scrollHeight || 0,
    doc.body.offsetHeight || 0
  );
}
