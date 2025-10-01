// utils.ts

interface MemberInfo {
  name: string;
  sponsor_id?: string | null;
  generation?: number;
  position_in_generation?: number;
  [key: string]: any; 
}

interface NetworkNode extends MemberInfo {
  id: string;
  children: NetworkNode[];
}

/**
 * Construit un arbre hiérarchique à partir d'une map plate des membres
 * @param members - objet avec les user_id comme clés et les infos comme valeurs
 * @param rootId - l'id de l'utilisateur racine (celui dont on veut afficher l'arbre)
 */
export function buildTree(members: Record<string, MemberInfo>, rootId: string): NetworkNode | null {
  if (!members[rootId]) return null;

  const root: NetworkNode = { id: rootId, ...members[rootId], children: [] };

  function attachChildren(node: NetworkNode) {
    const children = Object.entries(members)
      .filter(([_, m]) => m.sponsor_id === node.id)
      .map(([id, m]) => ({ id, ...m, children: [] }));

    node.children = children;

    children.forEach(attachChildren);
  }

  attachChildren(root);
  return root;
}


// Fonction utilitaire
export const formatMessage = (msg: any): string => {
  if (!msg) return "";
  if (Array.isArray(msg)) return msg.join("\n"); // chaque élément sur une ligne
  if (typeof msg === "object") return JSON.stringify(msg, null, 2);
  return String(msg);
};