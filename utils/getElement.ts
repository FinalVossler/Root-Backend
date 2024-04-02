type IElement = { _id: string } | string | undefined | null;

export const getElement = <T extends IElement>(
  child: T
): Exclude<T, string | undefined | null> => {
  if (!child) {
    throw new Error("Unable to get element");
  }

  if (typeof child === "string" || !child["_id"] || !child) {
    throw new Error("Unable to get element");
  }

  return child as Exclude<T, string | undefined | null>;
};

// For example: entity.model is either a IModel or an mongoose id. When we want the id,
export const getElementId = <T extends IElement>(child: T): string => {
  if (!child) {
    throw new Error("Unable to get element in order to get its id");
  }

  if (typeof child === "string") {
    return child;
  }

  if (child._id) return child._id.toString();

  return child.toString();
};
