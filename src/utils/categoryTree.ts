// @ts-nocheck
// 트리에서 특정 id까지의 루트→노드 경로 배열을 반환한다
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

// 주어진 자식 id의 부모 노드를 찾아 반환한다
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

// 노드와 부모 배열, 인덱스를 함께 반환한다 (이동 등에 사용)
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

// childId가 parent의 후손인지 확인한다 (순환 이동 방지용)
export function isDescendant(parent, childId) {
  if (parent.id === childId) return true;
  if (parent.children) {
    return parent.children.some((c) => isDescendant(c, childId));
  }
  return false;
}

// 중첩 트리를 depth 접두어가 포함된 평면 배열로 변환한다
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

// 검색어에 매칭되는 노드와 그 조상을 포함한 트리를 반환한다
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

// 트리의 모든 노드 isOpen 플래그를 일괄 설정한다
export function setAllOpen(nodes, open) {
  nodes.forEach((n) => {
    n.isOpen = open;
    if (n.children) setAllOpen(n.children, open);
  });
}

// 특정 depth까지 펼친 상태로 트리의 isOpen을 초기화한다
export function initOpenState(nodes, depth = 1, openUntilDepth = 2) {
  nodes.forEach((n) => {
    n.isOpen = depth <= openUntilDepth;
    if (n.children) initOpenState(n.children, depth + 1, openUntilDepth);
  });
}

// 트리를 서버 저장 포맷(parentId/depth/isNew 포함)으로 변환한다
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

// 트리에서 지정 id 노드를 제거한다
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

// 노드를 target 앞/뒤/자식 위치로 이동시킨다 (순환 이동 방지 포함)
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