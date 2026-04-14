export function findPath(nodes, id, path = []) {
  for (const n of nodes) {
    if (n.id === id) return [...path, n];
    if (n.children) {
      const res = findPath(n.children, id, [...path, n]);
      if (res) return res;
    }
  }
  return null;
}

export function findParentNode(nodes, childId) {
  for (const n of nodes) {
    if (n.children) {
      if (n.children.some((c) => c.id === childId)) return n;
      const found = findParentNode(n.children, childId);
      if (found) return found;
    }
  }
  return null;
}

export function findNodeAndParent(nodes, id) {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) return { node: nodes[i], parent: nodes, index: i };
    if (nodes[i].children) {
      const found = findNodeAndParent(nodes[i].children, id);
      if (found) return found;
    }
  }
  return null;
}

export function isDescendant(parent, childId) {
  if (parent.id === childId) return true;
  if (parent.children) {
    return parent.children.some((c) => isDescendant(c, childId));
  }
  return false;
}

export function flattenTree(nodes) {
  const result = [];
  const traverse = (list, depth = 0) => {
    list.forEach((n) => {
      result.push({
        id: n.id,
        name: n.name,
        prefix: "\u3000".repeat(depth) + (depth > 0 ? "\u2514 " : ""),
      });
      if (n.children) traverse(n.children, depth + 1);
    });
  };
  traverse(nodes);
  return result;
}

export function filterTree(nodes, query) {
  const q = query.toLowerCase();
  const filter = (list) =>
    list.reduce((acc, node) => {
      const match = node.name.toLowerCase().includes(q);
      const children = node.children ? filter(node.children) : [];
      if (match || children.length > 0)
        acc.push({ ...node, children, isOpen: true });
      return acc;
    }, []);
  return filter(nodes);
}

export function setAllOpen(nodes, open) {
  nodes.forEach((n) => {
    n.isOpen = open;
    if (n.children) setAllOpen(n.children, open);
  });
}

export function initOpenState(nodes, depth = 1, openUntilDepth = 2) {
  nodes.forEach((n) => {
    n.isOpen = depth <= openUntilDepth;
    if (n.children) initOpenState(n.children, depth + 1, openUntilDepth);
  });
}

export function buildSavePayload(nodes, parentId = null, depth = 1) {
  return nodes.map((n, i) => {
    const item = {
      name: n.name,
      code: n.code || "",
      sort: i,
      parentId,
      depth,
      isNew: !!n.isNew,
    };
    if (!n.isNew) item.id = n.id;
    item.children = n.children
      ? buildSavePayload(n.children, n.isNew ? null : n.id, depth + 1)
      : [];
    return item;
  });
}

export function removeNode(nodes, id) {
  const i = nodes.findIndex((n) => n.id === id);
  if (i !== -1) {
    nodes.splice(i, 1);
    return true;
  }
  for (const n of nodes) {
    if (n.children && removeNode(n.children, id)) return true;
  }
  return false;
}

export function moveNode(tree, sourceId, targetId, position) {
  if (sourceId === targetId) return;
  const source = findNodeAndParent(tree, sourceId);
  const target = findNodeAndParent(tree, targetId);
  if (!source || !target) return;
  if (isDescendant(source.node, targetId)) return;

  const [moved] = source.parent.splice(source.index, 1);
  const targetAfter = findNodeAndParent(tree, targetId);
  if (!targetAfter) {
    tree.push(moved);
    return;
  }

  if (position === "inside") {
    if (!targetAfter.node.children) targetAfter.node.children = [];
    targetAfter.node.children.push(moved);
    targetAfter.node.isOpen = true;
  } else if (position === "before") {
    targetAfter.parent.splice(targetAfter.index, 0, moved);
  } else {
    targetAfter.parent.splice(targetAfter.index + 1, 0, moved);
  }
}
