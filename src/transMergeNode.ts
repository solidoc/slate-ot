import {
  MergeNodeOperation,
  Operation,
  Path,
  Text,
  MoveNodeOperation,
  RemoveNodeOperation,
} from 'slate';

export const transMergeNode = (
  leftOp: MergeNodeOperation,
  rightOp: Operation,
  _side: 'left' | 'right'
): (MergeNodeOperation | MoveNodeOperation | RemoveNodeOperation)[] => {
  switch (rightOp.type) {
    case 'insert_text': {
      if (Path.equals(leftOp.path, Path.next(rightOp.path))) {
        return [
          {
            ...leftOp,
            position: leftOp.position + rightOp.text.length,
          },
        ];
      }

      return [leftOp];
    }

    case 'remove_text': {
      if (Path.equals(leftOp.path, Path.next(rightOp.path))) {
        return [
          {
            ...leftOp,
            position: leftOp.position - rightOp.text.length,
          },
        ];
      }

      return [leftOp];
    }

    case 'insert_node': {
      if (Path.equals(leftOp.path, rightOp.path)) {
        const offset = Text.isText(rightOp.node)
          ? rightOp.node.text.length
          : rightOp.node.children.length;

        return [
          leftOp, // merge the inserted node
          {
            ...leftOp, // merge the original node
            position: leftOp.position + offset,
          },
        ];
      }

      if (Path.isParent(Path.previous(leftOp.path), rightOp.path)) {
        return [
          {
            ...leftOp,
            position: leftOp.position + 1,
          },
        ];
      }

      return [
        {
          ...leftOp,
          path: Path.transform(leftOp.path, rightOp)!,
        },
      ];
    }

    case 'remove_node': {
      if (Path.isParent(Path.previous(leftOp.path), rightOp.path)) {
        return [
          {
            ...leftOp,
            position: leftOp.position - 1,
          },
        ];
      }

      const path = Path.transform(leftOp.path, rightOp);
      const prevPath = Path.transform(Path.previous(leftOp.path), rightOp);

      if (path && prevPath) {
        return [
          {
            ...leftOp,
            path,
          },
        ];
      }

      // conflicting ops, we have to discard merge
      // for now we simply remove the merged node
      else if (!path && prevPath) {
        return [
          {
            ...rightOp,
            path: prevPath,
          },
        ];
      } else if (path && !prevPath) {
        return [
          {
            ...rightOp,
            path,
          },
        ];
      }

      // both to-merge nodes are removed
      else {
        return [];
      }
    }

    case 'split_node': {
      if (Path.equals(leftOp.path, rightOp.path)) {
        return [
          leftOp,
          {
            ...leftOp,
            position: leftOp.position + rightOp.position,
          },
        ];
      }

      if (Path.equals(Path.previous(leftOp.path), rightOp.path)) {
        return [
          {
            ...leftOp,
            path: Path.next(leftOp.path),
            position: leftOp.position - rightOp.position,
          },
        ];
      }

      if (Path.isParent(Path.previous(leftOp.path), rightOp.path)) {
        return [
          {
            ...leftOp,
            position: leftOp.position + 1,
          },
        ];
      }

      const path = Path.transform(leftOp.path, rightOp)!;

      // conflicting ops, we choose to discard split
      if (path[path.length - 1] === 0) {
        return [
          {
            ...rightOp,
            type: 'merge_node',
            path: Path.next(rightOp.path),
          },
          leftOp,
        ];
      }

      return [
        {
          ...leftOp,
          path,
        },
      ];
    }

    case 'merge_node': {
      if (Path.equals(leftOp.path, rightOp.path)) {
        return [];
      }

      if (Path.equals(Path.previous(leftOp.path), rightOp.path)) {
        return [
          {
            ...leftOp,
            path: Path.previous(leftOp.path),
            position: leftOp.position + rightOp.position,
          },
        ];
      }

      if (Path.isParent(Path.previous(leftOp.path), rightOp.path)) {
        return [
          {
            ...leftOp,
            position: leftOp.position - 1,
          },
        ];
      }

      return [
        {
          ...leftOp,
          path: Path.transform(leftOp.path, rightOp)!,
        },
      ];
    }

    case 'move_node': {
      if (Path.equals(rightOp.path, rightOp.newPath)) {
        return [leftOp];
      }

      const path = leftOp.path;
      const prevPath = Path.previous(path);

      const newPath = Path.transform(path, rightOp)!;
      const newPrevPath = Path.transform(prevPath, rightOp)!;

      // Ops conflict with each other, discard merge.
      //  Note that the merge-and-split node cannot keep properties,
      //   so we have to remove it.
      if (!Path.equals(newPath, Path.next(newPrevPath))) {
        return [
          {
            type: 'remove_node',
            path: newPath,
            node: { text: '' },
          },
        ];
      }

      let position = leftOp.position;

      // only src path is leftOp's child
      if (Path.isParent(prevPath, rightOp.path)) {
        position--;
      }

      // only dst path is leftOp's child
      if (Path.isParent(prevPath, rightOp.newPath)) {
        position++;
      }

      return [
        {
          ...leftOp,
          path: newPath,
          position,
        },
      ];
    }

    // set_node
    default:
      return [leftOp];
  }
};
