export function getPathCoordinates(path, nodes) {
  return path
    .map((node) => nodes[node]?.position || nodes[node])
    .filter(Boolean);
}