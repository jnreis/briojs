const getParent = (node) => node.parentNode;
const getNextSibling = (node) => node.nextSibling;
const getOwnerDocument = (node) => node.ownerDocument;
const getChildNodes = (node) => node.childNodes;
const getNodeType = (node) => node.nodeType;
const removeAttribute = (element, name) => element.removeAttribute(name);
const getAttribute = (element, name) => element.getAttribute(name);
const insertBefore = (parent, node, reference) => parent.insertBefore(node, reference);
const removeChild = (parent, node) => parent == null ? void 0 : parent.removeChild(node);
function addEventListener(target, ...args) {
  target.addEventListener(...args);
}
function removeEventListener(target, ...args) {
  target.removeEventListener(...args);
}
export {
  addEventListener as a,
  getChildNodes as b,
  removeAttribute as c,
  getOwnerDocument as d,
  removeChild as e,
  getParent as f,
  getAttribute as g,
  getNodeType as h,
  getNextSibling as i,
  insertBefore as j,
  removeEventListener as r
};
//# sourceMappingURL=native-Da80auZ6.js.map
